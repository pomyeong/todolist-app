import assert from 'node:assert/strict';
import { test } from 'node:test';
import { client, query, signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const names = async (c) => (await c.get('/api/categories')).body.map((x) => x.name);
const todo = (categoryId) => ({
  title: 't',
  startDate: '2026-11-04',
  endDate: '2026-11-04',
  categoryId,
});

test('BR-23 목록은 기본이 맨 앞, 나머지는 생성 순', async () => {
  const c = await signupUser(ctx, 1);
  for (const name of ['업무', '학습', '운동'])
    assert.equal((await c.post('/api/categories', { name })).status, 201);
  assert.deepEqual(await names(c), ['기본', '업무', '학습', '운동']);
});

test("E-03-1 같은 이름·'기본'으로 추가·이름 변경은 409, DB-04 ' 업무 '는 '업무'와 같다", async () => {
  const c = await signupUser(ctx, 2);
  const work = (await c.post('/api/categories', { name: '업무' })).body;
  const study = (await c.post('/api/categories', { name: '학습' })).body;
  for (const res of [
    await c.post('/api/categories', { name: '업무' }),
    await c.post('/api/categories', { name: ' 업무 ' }),
    await c.post('/api/categories', { name: '기본' }),
    await c.patch(`/api/categories/${study.id}`, { name: '업무' }),
    await c.patch(`/api/categories/${study.id}`, { name: '기본' }),
  ]) {
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'DUPLICATE_CATEGORY');
  }
  assert.equal(work.name, '업무');
  const renamed = await c.patch(`/api/categories/${study.id}`, { name: '공부' });
  assert.equal(renamed.status, 200);
  assert.equal(renamed.body.name, '공부');
});

test('E-03-3 이름 31자·공백만은 400 VALIDATION_ERROR', async () => {
  const c = await signupUser(ctx, 3);
  for (const name of ['a'.repeat(31), '   ']) {
    const res = await c.post('/api/categories', { name });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  }
});

test('E-03-2 기본 카테고리 이름 변경·삭제는 400 DEFAULT_CATEGORY_IMMUTABLE, 변경 없음', async () => {
  const c = await signupUser(ctx, 4);
  const def = (await c.get('/api/categories')).body[0];
  for (const res of [
    await c.patch(`/api/categories/${def.id}`, { name: '바꿈' }),
    await c.delete(`/api/categories/${def.id}`),
  ]) {
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'DEFAULT_CATEGORY_IMMUTABLE');
  }
  assert.deepEqual(await names(c), ['기본']);
});

test('BR-14 할일 2건이 있는 카테고리 삭제는 204, 할일은 기본으로 이동하고 수 불변', async () => {
  const c = await signupUser(ctx, 5);
  const def = (await c.get('/api/categories')).body[0];
  const work = (await c.post('/api/categories', { name: '업무' })).body;
  const ids = [
    (await c.post('/api/todos', todo(work.id))).body.id,
    (await c.post('/api/todos', todo(work.id))).body.id,
  ];
  assert.equal((await c.delete(`/api/categories/${work.id}`)).status, 204);
  const { rows } = await query('SELECT category_id FROM todos WHERE user_id = $1 ORDER BY id', [
    c.user.id,
  ]);
  assert.equal(rows.length, 2);
  assert.ok(
    rows.every((r) => r.category_id === def.id),
    JSON.stringify({ ids, rows }),
  );
  assert.deepEqual(await names(c), ['기본']);
});

test('NFR-10 삭제 도중 오류가 나면 할일 이동도 롤백된다', async (t) => {
  t.mock.method(console, 'error', () => {});
  const c = await signupUser(ctx, 6);
  const work = (await c.post('/api/categories', { name: '업무' })).body;
  await c.post('/api/todos', todo(work.id));
  await query(`CREATE FUNCTION fail_del() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'forced'; END $$`);
  await query(
    'CREATE TRIGGER fail_del BEFORE DELETE ON categories FOR EACH ROW EXECUTE FUNCTION fail_del()',
  );
  try {
    assert.equal((await c.delete(`/api/categories/${work.id}`)).status, 500);
  } finally {
    await query('DROP TRIGGER fail_del ON categories');
    await query('DROP FUNCTION fail_del()');
  }
  const { rows } = await query('SELECT category_id FROM todos WHERE user_id = $1', [c.user.id]);
  assert.deepEqual(rows, [{ category_id: work.id }]);
  assert.deepEqual(await names(c), ['기본', '업무']);
});

test('PD-13 /api/categories/abc는 404 NOT_FOUND', async () => {
  const c = await signupUser(ctx, 7);
  for (const res of [
    await c.patch('/api/categories/abc', { name: 'x' }),
    await c.delete('/api/categories/abc'),
  ]) {
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  }
});

test('PD-22 타인의 기본 카테고리 삭제·수정은 400이 아니라 404', async () => {
  const u1 = await signupUser(ctx, 8);
  const u2 = await signupUser(ctx, 9);
  const u2Default = (await u2.get('/api/categories')).body[0];
  assert.equal((await u1.delete(`/api/categories/${u2Default.id}`)).status, 404);
  assert.equal((await u1.patch(`/api/categories/${u2Default.id}`, { name: 'x' })).status, 404);
  assert.equal((await client(ctx).get('/api/categories')).status, 401);
});
