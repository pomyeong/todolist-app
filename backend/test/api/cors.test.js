import assert from 'node:assert/strict';
import { test } from 'node:test';
import { config } from '../../src/config.js';
import { useServer } from '../helpers/index.js';

const ctx = useServer();
const ORIGIN = config.corsOrigin;
const call = (method, path, origin, headers = {}) =>
  fetch(ctx.base + path, { method, headers: { ...(origin && { origin }), ...headers } });

test('PR-S-04 허용 출처의 preflight는 204와 메서드·헤더·자격 증명 허용', async () => {
  const res = await call('OPTIONS', '/api/todos/1', ORIGIN, {
    'access-control-request-method': 'PATCH',
    'access-control-request-headers': 'content-type',
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  assert.match(res.headers.get('access-control-allow-methods'), /PATCH/);
  assert.match(res.headers.get('access-control-allow-headers'), /Content-Type/);
});

test('PR-S-04 허용 출처의 일반 요청과 오류 응답(401)에도 CORS 헤더', async () => {
  for (const [path, status] of [
    ['/api/health', 200],
    ['/api/me', 401],
  ]) {
    const res = await call('GET', path, ORIGIN);
    assert.equal(res.status, status, path);
    assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN, path);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true', path);
    assert.match(res.headers.get('vary'), /Origin/);
  }
});

test('PR-S-04 다른 출처·Origin 없음에는 CORS 헤더가 없고, 다른 출처 preflight는 허용되지 않음', async () => {
  for (const origin of ['http://evil.example', undefined]) {
    const res = await call('GET', '/api/health', origin);
    assert.equal(res.headers.get('access-control-allow-origin'), null, String(origin));
  }
  const pre = await call('OPTIONS', '/api/todos', 'http://evil.example', {
    'access-control-request-method': 'POST',
  });
  assert.notEqual(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), null);
});
