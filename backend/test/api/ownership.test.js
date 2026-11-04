import assert from 'node:assert/strict';
import { test } from 'node:test';
import { query, signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const TODAY = '2026-11-04';
const MISSING = 999999;
const s = {}; // 준비 테스트에서 채운다: u1, u2, c9, t9, t1, base

const snap = async (uid) => ({
  categories: (
    await query(
      'SELECT id, name, is_default, updated_at FROM categories WHERE user_id = $1 ORDER BY id',
      [uid],
    )
  ).rows,
  todos: (
    await query(
      `SELECT id, category_id, title, description, start_date, end_date, completed, completed_at, updated_at
       FROM todos WHERE user_id = $1 ORDER BY id`,
      [uid],
    )
  ).rows,
});
const t1Row = async () => (await query('SELECT * FROM todos WHERE id = $1', [s.t1])).rows[0];
const todoCount = async (uid) =>
  (await query('SELECT count(*)::int AS n FROM todos WHERE user_id = $1', [uid])).rows[0].n;
const body = (categoryId) => ({
  title: '수정',
  startDate: TODAY,
  endDate: TODAY,
  categoryId,
});

// U1이 호출하는 9개 요청(카테고리 ID·할일 ID·카테고리 ID 인자만 바꿔 재사용)
const calls = {
  'PATCH /categories/:id': (c, id) => c.patch(`/api/categories/${id}`, { name: '탈취' }),
  'DELETE /categories/:id': (c, id) => c.delete(`/api/categories/${id}`),
  'GET /todos/:id': (c, id) => c.get(`/api/todos/${id}`),
  'PATCH /todos/:id': (c, id) => c.patch(`/api/todos/${id}`, body(s.c1)),
  'DELETE /todos/:id': (c, id) => c.delete(`/api/todos/${id}`),
  'PATCH /todos/:id/completed': (c, id) =>
    c.patch(`/api/todos/${id}/completed`, { completed: true }),
  'POST /todos categoryId': (c, id) => c.post('/api/todos', body(id)),
  'PATCH /todos/T1 categoryId': (c, id) => c.patch(`/api/todos/${s.t1}`, body(id)),
  'GET /todos?categoryId': (c, id) => c.get(`/api/todos?categoryId=${id}&today=${TODAY}`),
};
// 호출별로 타인 리소스를 가리키는 ID
const other = (name) =>
  name.includes('/categories/') || name.includes('categoryId') ? s.c9 : s.t9;

test('준비: U1·U2 가입, U2 카테고리 C9·할일 T9, U1 할일 T1, 기준 스냅샷', async () => {
  s.u1 = await signupUser(ctx, 1);
  s.u2 = await signupUser(ctx, 2);
  s.c9 = (await s.u2.post('/api/categories', { name: '비밀' })).body.id;
  s.t9 = (
    await s.u2.post('/api/todos', {
      title: '비밀 할일',
      description: '설명',
      startDate: '2026-11-03',
      endDate: '2026-11-10',
      categoryId: s.c9,
    })
  ).body.id;
  s.c1 = (await s.u1.get('/api/categories')).body[0].id;
  s.t1 = (await s.u1.post('/api/todos', body(s.c1))).body.id;
  assert.ok(s.c9 && s.t9 && s.t1);
  s.base = await snap(s.u2.user.id);
  assert.equal(s.base.todos.length, 1);
  assert.equal(s.base.categories.length, 2);
});

test('BR-04 타인 카테고리 C9 수정·삭제는 404 NOT_FOUND, 데이터 불변', async () => {
  for (const name of ['PATCH /categories/:id', 'DELETE /categories/:id']) {
    const res = await calls[name](s.u1, s.c9);
    assert.equal(res.status, 404, name);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  }
  assert.deepEqual(await snap(s.u2.user.id), s.base);
});

test('E-05-2·E-06-1·E-07-1 타인 할일 T9 조회·수정·삭제·완료는 404, 데이터 불변', async () => {
  for (const name of [
    'GET /todos/:id',
    'PATCH /todos/:id',
    'DELETE /todos/:id',
    'PATCH /todos/:id/completed',
  ]) {
    const res = await calls[name](s.u1, s.t9);
    assert.equal(res.status, 404, name);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  }
  assert.deepEqual(await snap(s.u2.user.id), s.base);
});

test('E-04-4·BR-04 타인 카테고리로 할일 생성·이동은 404, U1·U2 데이터 불변', async () => {
  const n = await todoCount(s.u1.user.id);
  const before = await t1Row();
  for (const name of ['POST /todos categoryId', 'PATCH /todos/T1 categoryId']) {
    const res = await calls[name](s.u1, s.c9);
    assert.equal(res.status, 404, name);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  }
  assert.equal(await todoCount(s.u1.user.id), n);
  assert.deepEqual(await t1Row(), before);
  assert.deepEqual(await snap(s.u2.user.id), s.base);
});

test('E-08-2 타인 카테고리로 목록 필터는 404', async () => {
  const res = await calls['GET /todos?categoryId'](s.u1, s.c9);
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

test('BR-04 U1의 할일 목록·캘린더에 T9가 노출되지 않는다', async () => {
  const list = await s.u1.get(`/api/todos?today=${TODAY}`);
  const cal = await s.u1.get(`/api/calendar?from=2026-11-01&to=2026-11-30&today=${TODAY}`);
  assert.equal(list.status, 200);
  assert.equal(cal.status, 200);
  assert.ok(!JSON.stringify(list.body).includes(`"id":${s.t9},`));
  assert.ok(!JSON.stringify(cal.body).includes(`"id":${s.t9},`));
  assert.ok(JSON.stringify(list.body).includes(`"id":${s.t1},`), '대조: 자기 T1은 보인다');
});

test('BR-04 타인 ID와 없는 ID의 응답(status·body)이 동일하다(존재 여부 비노출)', async () => {
  for (const name of Object.keys(calls)) {
    const theirs = await calls[name](s.u1, other(name));
    const missing = await calls[name](s.u1, MISSING);
    assert.equal(theirs.status, 404, name);
    assert.deepEqual(
      { status: theirs.status, body: theirs.body },
      {
        status: missing.status,
        body: missing.body,
      },
      name,
    );
  }
  assert.deepEqual(await snap(s.u2.user.id), s.base);
});
