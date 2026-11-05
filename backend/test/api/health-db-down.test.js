// DB를 쓸 수 없을 때의 헬스 체크(PD-14). 이 파일의 프로세스에서만 풀을 먼저 닫아 실제 쿼리 실패를 만든다(mock 없음, PR-T-04).
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../../src/app.js';
import { close } from '../../src/db.js';

let server;
let base;
before(async () => {
  await close();
  server = createApp().listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test('PD-14 DB를 쓸 수 없으면 GET /api/health는 503 { ok: false, db: down }', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, db: 'down' });
});
