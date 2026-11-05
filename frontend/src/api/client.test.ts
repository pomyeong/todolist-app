import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_MESSAGE, request } from './client';
import { ApiError } from './types';

type Route = (url: string, method: string, nth: number) => Response | Promise<Response>;

const fetchMock = vi.fn<typeof fetch>();

// URL·method로 분기. nth는 같은 "METHOD url" 호출 순번(0부터). 매 호출 새 Response 생성.
function route(handler: Route): void {
  const seen = new Map<string, number>();
  fetchMock.mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const key = `${method} ${url}`;
    const nth = seen.get(key) ?? 0;
    seen.set(key, nth + 1);
    return handler(url, method, nth);
  });
}

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fail = (status: number, code: string, message: string, fields?: Record<string, string>) =>
  json(status, { error: { code, message, fields } });

const unauthorized = (): Response => fail(401, 'UNAUTHORIZED', '로그인이 필요합니다.');

const calls = (): string[] =>
  fetchMock.mock.calls.map(([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`);

const count = (key: string): number => calls().filter((c) => c === key).length;

async function catchError(p: Promise<unknown>): Promise<ApiError> {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(ApiError);
    return e as ApiError;
  }
  throw new Error('예외가 발생하지 않았습니다.');
}

const REFRESH = 'POST /api/auth/refresh';

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('request 기본 동작', () => {
  it('200 JSON 본문을 반환하고 method·body·Content-Type을 전달한다', async () => {
    route(() => json(200, { id: 1, name: '업무' }));
    const result = await request<{ id: number; name: string }>('POST', '/api/categories', {
      name: '업무',
    });
    expect(result).toEqual({ id: 1, name: '업무' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0];
    expect(String(input)).toBe('/api/categories');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ name: '업무' }));
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('body가 없으면 Content-Type 헤더와 body를 보내지 않는다', async () => {
    route(() => json(200, []));
    await request('GET', '/api/categories');
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('GET');
    expect(init?.body).toBeUndefined();
    expect(new Headers(init?.headers).has('Content-Type')).toBe(false);
  });

  it('204 → undefined', async () => {
    route(() => new Response(null, { status: 204 }));
    await expect(request<void>('DELETE', '/api/todos/1')).resolves.toBeUndefined();
  });
});

describe('request 오류 변환', () => {
  it('409 DUPLICATE_EMAIL → ApiError(status, code, message)', async () => {
    route(() => fail(409, 'DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.'));
    const err = await catchError(
      request('POST', '/api/auth/signup', { email: 'a@b.c', password: 'x', name: 'n' }),
    );
    expect(err.status).toBe(409);
    expect(err.code).toBe('DUPLICATE_EMAIL');
    expect(err.message).toBe('이미 사용 중인 이메일입니다.');
  });

  it('400 fields → ApiError.fields', async () => {
    const fields = { title: '제목을 입력하세요.' };
    route(() => fail(400, 'VALIDATION_ERROR', '입력값을 확인하세요.', fields));
    const err = await catchError(request('POST', '/api/todos', { title: '' }));
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('입력값을 확인하세요.');
    expect(err.fields).toEqual(fields);
  });

  it('빈 본문 500 → INTERNAL_ERROR, FALLBACK_MESSAGE', async () => {
    route(() => new Response(null, { status: 500 }));
    const err = await catchError(request('GET', '/api/categories'));
    expect(err.status).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe(FALLBACK_MESSAGE);
  });

  it('형식이 다른 JSON 본문 → INTERNAL_ERROR, FALLBACK_MESSAGE', async () => {
    route(() => json(502, { message: 'bad gateway' }));
    const err = await catchError(request('GET', '/api/categories'));
    expect(err.status).toBe(502);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe(FALLBACK_MESSAGE);
  });

  it('fetch reject → status 0, INTERNAL_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const err = await catchError(request('GET', '/api/categories'));
    expect(err.status).toBe(0);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe(FALLBACK_MESSAGE);
  });
});

describe('401 토큰 갱신 (PR-L-12)', () => {
  it('401 UNAUTHORIZED → refresh 1회 → 재전송 결과 반환', async () => {
    route((url, _method, nth) => {
      if (url === '/api/auth/refresh') return new Response(null, { status: 204 });
      return nth === 0 ? unauthorized() : json(200, [{ id: 1 }]);
    });
    await expect(request('GET', '/api/todos')).resolves.toEqual([{ id: 1 }]);
    expect(calls()).toEqual(['GET /api/todos', REFRESH, 'GET /api/todos']);
  });

  it('refresh 401 → 원래 401 ApiError, 재전송 없음', async () => {
    route(() => unauthorized()); // refresh도 401
    const err = await catchError(request('GET', '/api/todos'));
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(calls()).toEqual(['GET /api/todos', REFRESH]);
  });

  it('refresh 요청 자체가 reject → 원래 401 ApiError, 재전송 없음', async () => {
    route((url) => {
      if (url === '/api/auth/refresh') throw new TypeError('Failed to fetch');
      return unauthorized();
    });
    const err = await catchError(request('GET', '/api/todos'));
    expect(err.code).toBe('UNAUTHORIZED');
    expect(calls()).toEqual(['GET /api/todos', REFRESH]);
  });

  it('재전송도 401 → throw, refresh 1회만', async () => {
    route((url) =>
      url === '/api/auth/refresh' ? new Response(null, { status: 204 }) : unauthorized(),
    );
    const err = await catchError(request('GET', '/api/todos'));
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(calls()).toEqual(['GET /api/todos', REFRESH, 'GET /api/todos']);
  });

  it('동시 3개 401 → refresh 1회, 3개 모두 재전송 성공', async () => {
    let resolveRefresh: (r: Response) => void = () => {};
    const refreshPending = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });
    route((url, _method, nth) => {
      if (url === '/api/auth/refresh') return refreshPending;
      return nth === 0 ? unauthorized() : json(200, { url });
    });

    const paths = ['/api/todos', '/api/categories', '/api/me'];
    const all = Promise.all(paths.map((p) => request('GET', p)));

    await vi.waitFor(() => expect(count(REFRESH)).toBe(1));
    // 나머지 요청의 401 처리가 모두 끝날 시간을 준다
    await new Promise((r) => setTimeout(r, 0));
    expect(count(REFRESH)).toBe(1);

    resolveRefresh(new Response(null, { status: 204 }));
    await expect(all).resolves.toEqual(paths.map((url) => ({ url })));
    expect(count(REFRESH)).toBe(1);
    for (const p of paths) expect(count(`GET ${p}`)).toBe(2);
  });

  it('/api/auth/ 경로의 401은 refresh하지 않는다', async () => {
    route((url) =>
      url === '/api/auth/login'
        ? fail(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.')
        : unauthorized(),
    );
    const loginErr = await catchError(
      request('POST', '/api/auth/login', { email: 'a@b.c', password: 'x' }),
    );
    expect(loginErr.code).toBe('INVALID_CREDENTIALS');
    const logoutErr = await catchError(request('POST', '/api/auth/logout'));
    expect(logoutErr.code).toBe('UNAUTHORIZED');
    expect(count(REFRESH)).toBe(0);
    expect(calls()).toEqual(['POST /api/auth/login', 'POST /api/auth/logout']);
  });

  it('401이라도 code가 UNAUTHORIZED가 아니면 refresh하지 않는다', async () => {
    route(() => fail(401, 'INVALID_PASSWORD', '현재 비밀번호가 올바르지 않습니다.'));
    const err = await catchError(request('GET', '/api/todos'));
    expect(err.code).toBe('INVALID_PASSWORD');
    expect(count(REFRESH)).toBe(0);
  });

  it('갱신 완료 후 새 401이 오면 refresh를 다시 호출한다(finally 초기화)', async () => {
    route((url, _method, nth) => {
      if (url === '/api/auth/refresh') return new Response(null, { status: 204 });
      return nth % 2 === 0 ? unauthorized() : json(200, { nth });
    });
    await expect(request('GET', '/api/todos')).resolves.toEqual({ nth: 1 });
    await expect(request('GET', '/api/todos')).resolves.toEqual({ nth: 3 });
    expect(calls()).toEqual([
      'GET /api/todos',
      REFRESH,
      'GET /api/todos',
      'GET /api/todos',
      REFRESH,
      'GET /api/todos',
    ]);
  });
});
