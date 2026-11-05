import assert from 'node:assert/strict';
import { test } from 'node:test';
import { client, useServer } from '../helpers/index.js';

const ctx = useServer();

test('P-25 GET /api/health는 인증 없이 DB 연결까지 확인해 200 { ok: true, db: up }', async () => {
  const res = await client(ctx).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, db: 'up' });
});

test('PD-30 개발 환경이 아니면(NODE_ENV=test) Swagger UI·명세 경로는 404', async () => {
  for (const path of ['/api/docs', '/api/docs/swagger.yaml']) {
    const res = await client(ctx).get(path);
    assert.equal(res.status, 404, path);
  }
});

test('알 수 없는 /api 경로는 404 NOT_FOUND', async () => {
  const res = await client(ctx).get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
