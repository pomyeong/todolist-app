// API 통합 테스트 헬퍼(PR-T-04): 실제 앱(포트 0)과 todolist_test DB를 쓴다. 의존성 없이 내장 fetch만 쓴다(PD-09).
import { after, before } from 'node:test';
import { createApp } from '../../src/app.js';
import { close, query } from '../../src/db.js';

export { query };

export function resetDb() {
  return query('TRUNCATE users, categories, todos, refresh_tokens RESTART IDENTITY CASCADE');
}

// 테스트 파일 맨 위에서 한 번 호출한다: 시작 시 DB 비우고 서버 기동, 끝나면 서버·풀 종료.
export function useServer() {
  const ctx = { base: '' };
  let server;
  before(async () => {
    await resetDb();
    server = createApp().listen(0);
    ctx.base = `http://localhost:${server.address().port}`;
  });
  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await close();
  });
  return ctx;
}

// 쿠키를 저장해 다음 요청에 붙이는 클라이언트. 쿠키 Path를 지켜 브라우저처럼 보낸다.
export function client(ctx) {
  const jar = new Map(); // name → { value, path }
  async function request(method, path, body) {
    const cookie = [...jar]
      .filter(([, c]) => path.startsWith(c.path))
      .map(([name, c]) => `${name}=${c.value}`)
      .join('; ');
    const headers = {};
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await fetch(ctx.base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const setCookies = res.headers.getSetCookie();
    for (const sc of setCookies) {
      const [pair, ...attrs] = sc.split(';').map((s) => s.trim());
      const [name, value] = [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)];
      const cookiePath = attrs.find((a) => a.toLowerCase().startsWith('path='))?.slice(5) ?? '/';
      if (value === '' || /max-age=0\b/i.test(sc) || /expires=thu, 01 jan 1970/i.test(sc))
        jar.delete(name);
      else jar.set(name, { value, path: cookiePath });
    }
    const text = await res.text();
    return {
      status: res.status,
      body: text ? JSON.parse(text) : undefined,
      setCookies,
      headers: res.headers,
    };
  }
  return {
    jar,
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b),
    patch: (p, b) => request('PATCH', p, b),
    put: (p, b) => request('PUT', p, b),
    delete: (p) => request('DELETE', p),
  };
}

// 가입한 사용자(U1·U2 등)의 클라이언트를 돌려준다.
export async function signupUser(ctx, n = 1) {
  const c = client(ctx);
  const res = await c.post('/api/auth/signup', {
    email: `u${n}@test.local`,
    password: 'password123',
    name: `사용자${n}`,
  });
  if (res.status !== 201) throw new Error(`가입 실패: ${res.status} ${JSON.stringify(res.body)}`);
  c.user = res.body;
  return c;
}
