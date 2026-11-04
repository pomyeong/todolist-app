import assert from 'node:assert/strict';
import { test } from 'node:test';
import { client, useServer } from '../helpers/index.js';

const ctx = useServer();

test('P-25 GET /api/health는 인증 없이 200 { ok: true }', async () => {
  const res = await client(ctx).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});

test('알 수 없는 /api 경로는 404 NOT_FOUND', async () => {
  const res = await client(ctx).get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
