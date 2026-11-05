import { log, logError } from '../lib/log';
import type { ErrorCode } from './types';
import { ApiError } from './types';

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export const FALLBACK_MESSAGE = '서버에 연결할 수 없습니다.';
// PR-S-04: API 주소는 이 한 곳에서만 읽는다. 없으면 같은 출처(테스트).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// 같은 탭의 동시 401은 진행 중인 갱신 하나를 공유한다(PR-L-12).
let refreshing: Promise<boolean> | null = null;

interface ErrorBody {
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
}

function isErrorBody(v: unknown): v is ErrorBody {
  if (typeof v !== 'object' || v === null || !('error' in v)) return false;
  const e = v.error;
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof e.code === 'string' &&
    'message' in e &&
    typeof e.message === 'string'
  );
}

async function send<T>(method: Method, path: string, body: unknown, retried: boolean): Promise<T> {
  const started = performance.now();
  const ms = () => `${Math.round(performance.now() - started)}ms`;
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method,
      credentials: 'include', // 다른 출처의 API에 인증 쿠키를 보내고 받는다
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    logError('api', method, path, '연결 실패', ms(), e);
    throw new ApiError(0, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  }

  if (res.ok) {
    log('api', method, path, res.status, ms());
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    parsed = undefined;
  }
  if (!isErrorBody(parsed)) {
    logError('api', method, path, res.status, ms(), '오류 형식 아님');
    throw new ApiError(res.status, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  }
  const { code, message, fields } = parsed.error;
  const err = new ApiError(res.status, code, message, fields);
  logError('api', method, path, res.status, code, ms());

  if (code === 'UNAUTHORIZED' && !path.startsWith('/api/auth/') && !retried) {
    refreshing ??= fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(
        (r) => r.ok,
        () => false,
      )
      .then((ok) => {
        log('auth', ok ? '토큰 갱신 성공, 재요청' : '토큰 갱신 실패');
        return ok;
      })
      .finally(() => {
        refreshing = null;
      });
    if (await refreshing) return send<T>(method, path, body, true);
  }
  throw err;
}

export function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  return send<T>(method, path, body, false);
}
