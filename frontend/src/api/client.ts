import type { ErrorCode } from './types';
import { ApiError } from './types';

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export const FALLBACK_MESSAGE = '서버에 연결할 수 없습니다.';

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
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    parsed = undefined;
  }
  if (!isErrorBody(parsed)) throw new ApiError(res.status, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  const { code, message, fields } = parsed.error;
  const err = new ApiError(res.status, code, message, fields);

  if (code === 'UNAUTHORIZED' && !path.startsWith('/api/auth/') && !retried) {
    refreshing ??= fetch('/api/auth/refresh', { method: 'POST' })
      .then(
        (r) => r.ok,
        () => false,
      )
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
