import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import pg from 'pg';
import { query, signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const todo = (over) => ({ title: '할일', startDate: '2026-11-04', endDate: '2026-11-05', ...over });
const countRows = async (userId) =>
  (await query('SELECT count(*)::int AS n FROM todos WHERE user_id = $1', [userId])).rows[0].n;

describe('할일 CRUD (T-BE-11)', () => {
  test('BR-11 카테고리 없이 등록하면 기본 카테고리, 201, 응답에 categoryName·문자열 날짜(NFR-11)', async () => {
    const c = await signupUser(ctx, 1);
    const res = await c.post('/api/todos', todo());
    assert.equal(res.status, 201);
    assert.equal(res.body.categoryName, '기본');
    assert.equal(res.body.startDate, '2026-11-04');
    assert.equal(res.body.endDate, '2026-11-05');
    assert.equal(res.body.completedAt, null);
    assert.ok(!('status' in res.body));
  });

  test('BR-08 과거 날짜 등록 성공', async () => {
    const c = await signupUser(ctx, 2);
    assert.equal(
      (await c.post('/api/todos', todo({ startDate: '2020-01-01', endDate: '2020-01-02' }))).status,
      201,
    );
  });

  test('E-04-1~3 누락·공백 제목·시작일>종료일·제목 101자·설명 1001자는 400이고 저장 안 됨', async () => {
    const c = await signupUser(ctx, 3);
    const cases = [
      { title: undefined },
      { startDate: undefined },
      { endDate: undefined },
      { title: '   ' },
      { startDate: '2026-11-10', endDate: '2026-11-02' },
      { title: 'a'.repeat(101) },
      { description: 'a'.repeat(1001) },
    ];
    for (const over of cases) {
      const res = await c.post('/api/todos', todo(over));
      assert.equal(res.status, 400, JSON.stringify(over));
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    }
    assert.equal(await countRows(c.user.id), 0);
  });

  test("DB-11 설명 '  '은 null로 저장·반환", async () => {
    const c = await signupUser(ctx, 4);
    const res = await c.post('/api/todos', todo({ description: '  ' }));
    assert.equal(res.body.description, null);
    const { rows } = await query('SELECT description FROM todos WHERE id = $1', [res.body.id]);
    assert.equal(rows[0].description, null);
  });

  test('BR-11 PD-20 수정에서 categoryId·description을 빼면 기존 값 유지, 단건 조회에 categoryName', async () => {
    const c = await signupUser(ctx, 5);
    const work = (await c.post('/api/categories', { name: '업무' })).body;
    const created = (await c.post('/api/todos', todo({ categoryId: work.id, description: '설명' })))
      .body;
    const res = await c.patch(`/api/todos/${created.id}`, todo({ title: '수정됨' }));
    assert.equal(res.status, 200);
    assert.equal(res.body.title, '수정됨');
    assert.equal(res.body.categoryId, work.id);
    assert.equal(res.body.categoryName, '업무');
    assert.equal(res.body.description, '설명');
    const got = await c.get(`/api/todos/${created.id}`);
    assert.equal(got.status, 200);
    assert.equal(got.body.categoryName, '업무');
    assert.ok(!('status' in got.body));
  });

  test('PD-27 수정에서 description: null은 비우고, title: null·categoryId: null은 400', async () => {
    const c = await signupUser(ctx, 6);
    const created = (await c.post('/api/todos', todo({ description: '설명' }))).body;
    assert.equal(
      (await c.patch(`/api/todos/${created.id}`, todo({ description: null }))).body.description,
      null,
    );
    for (const over of [{ title: null }, { categoryId: null }]) {
      assert.equal((await c.patch(`/api/todos/${created.id}`, todo(over))).status, 400);
    }
  });

  test('PD-21 완료 true → completedAt 설정, 다시 true → 그대로, false → null. 응답에 categoryName', async () => {
    const c = await signupUser(ctx, 7);
    const { id } = (await c.post('/api/todos', todo())).body;
    const first = await c.patch(`/api/todos/${id}/completed`, { completed: true });
    assert.equal(first.status, 200);
    assert.equal(first.body.completed, true);
    assert.ok(first.body.completedAt);
    assert.equal(first.body.categoryName, '기본');
    const again = await c.patch(`/api/todos/${id}/completed`, { completed: true });
    assert.equal(again.body.completedAt, first.body.completedAt);
    const undo = await c.patch(`/api/todos/${id}/completed`, { completed: false });
    assert.equal(undo.body.completedAt, null);
  });

  test('E-06 { completed: "yes" }는 400 VALIDATION_ERROR', async () => {
    const c = await signupUser(ctx, 8);
    const { id } = (await c.post('/api/todos', todo())).body;
    const res = await c.patch(`/api/todos/${id}/completed`, { completed: 'yes' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('E-07-1 삭제 204 후 단건 조회 404, 정수 아닌 id는 404(PD-13)', async () => {
    const c = await signupUser(ctx, 9);
    const { id } = (await c.post('/api/todos', todo())).body;
    assert.equal((await c.delete(`/api/todos/${id}`)).status, 204);
    assert.equal((await c.get(`/api/todos/${id}`)).status, 404);
    assert.equal((await c.get('/api/todos/abc')).status, 404);
  });

  test('BR-04 타인의 카테고리로 등록·수정하면 404', async () => {
    const u1 = await signupUser(ctx, 10);
    const u2 = await signupUser(ctx, 11);
    const c9 = (await u2.post('/api/categories', { name: 'C9' })).body;
    assert.equal((await u1.post('/api/todos', todo({ categoryId: c9.id }))).status, 404);
    const { id } = (await u1.post('/api/todos', todo())).body;
    assert.equal((await u1.patch(`/api/todos/${id}`, todo({ categoryId: c9.id }))).status, 404);
  });

  test('BR-24 시작·종료 시간: 저장·응답은 HH:MM, 시간 없으면 null, 수정에서 생략하면 비움(PD-20)', async () => {
    const c = await signupUser(ctx, 30);
    const none = (await c.post('/api/todos', todo())).body;
    assert.deepEqual([none.startTime, none.endTime], [null, null]);

    const res = await c.post('/api/todos', todo({ startTime: '08:00', endTime: '23:30' }));
    assert.equal(res.status, 201);
    assert.deepEqual([res.body.startTime, res.body.endTime], ['08:00', '23:30']);
    const url = `/api/todos/${res.body.id}`;
    assert.equal((await c.get(url)).body.startTime, '08:00');
    const listed = (await c.get('/api/todos?today=2026-11-04')).body.find(
      (t) => t.id === res.body.id,
    );
    assert.equal(listed.endTime, '23:30');
    const cal = (await c.get('/api/calendar?from=2026-11-01&to=2026-11-30&today=2026-11-04')).body;
    assert.equal(cal.find((t) => t.id === res.body.id).startTime, '08:00');

    const upd = await c.patch(url, todo({ startTime: '09:15' }));
    assert.deepEqual([upd.body.startTime, upd.body.endTime], ['09:15', null]);
  });

  test('BR-24 같은 날 시작 > 종료·형식 오류는 400이고 저장·변경 안 됨', async () => {
    const c = await signupUser(ctx, 31);
    const before = await countRows(c.user.id);
    for (const bad of [
      { startDate: '2026-11-04', endDate: '2026-11-04', startTime: '18:00', endTime: '09:00' },
      { startTime: '24:00' },
      { endTime: '9:5' },
    ]) {
      const res = await c.post('/api/todos', todo(bad));
      assert.equal(res.status, 400, JSON.stringify(bad));
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    }
    assert.equal(await countRows(c.user.id), before);
    const { id } = (await c.post('/api/todos', todo({ startTime: '10:00' }))).body;
    const res = await c.patch(
      `/api/todos/${id}`,
      todo({
        startDate: '2026-11-04',
        endDate: '2026-11-04',
        startTime: '12:00',
        endTime: '11:00',
      }),
    );
    assert.equal(res.status, 400);
    assert.equal((await c.get(`/api/todos/${id}`)).body.startTime, '10:00');
  });

  test('DB-14 ck_todos_times: 검증을 거치지 않은 같은 날 시작 > 종료는 DB가 거부', async () => {
    const c = await signupUser(ctx, 32);
    const { id } = (await c.post('/api/todos', todo())).body;
    await assert.rejects(
      query(
        "UPDATE todos SET start_date = end_date, start_time = '18:00', end_time = '09:00' WHERE id = $1",
        [id],
      ),
      (e) => e.code === '23514' && e.constraint === 'ck_todos_times',
    );
  });
});

describe('할일 목록 + 필터 (T-BE-12)', () => {
  const TODAY = '2026-11-04';
  let u1;
  let u2;
  let cats;

  // 시나리오 3.0 예시 데이터: T1~T4, 카테고리 기본·업무·학습. U2는 C9·T9.
  test('준비: 시나리오 3.0 예시 데이터', async () => {
    u1 = await signupUser(ctx, 20);
    u2 = await signupUser(ctx, 21);
    cats = { 기본: (await u1.get('/api/categories')).body[0].id };
    for (const name of ['업무', '학습'])
      cats[name] = (await u1.post('/api/categories', { name })).body.id;
    const add = async (title, cat, s, e) =>
      (await u1.post('/api/todos', { title, categoryId: cats[cat], startDate: s, endDate: e })).body
        .id;
    await add('T1', '업무', '2026-10-28', '2026-11-03');
    await add('T2', '학습', '2026-11-02', '2026-11-10');
    await add('T3', '기본', '2026-11-20', '2026-12-02');
    const t4 = await add('T4', '기본', '2026-11-04', '2026-11-04');
    await u1.patch(`/api/todos/${t4}/completed`, { completed: true });
    const c9 = (await u2.post('/api/categories', { name: 'C9' })).body.id;
    await u2.post('/api/todos', { title: 'T9', categoryId: c9, startDate: TODAY, endDate: TODAY });
    cats.C9 = c9;
  });

  const titles = (res) => res.body.map((t) => t.title);

  test('SC-08 BR-20 필터 없음: T1, T4, T2, T3 순, 각 항목에 status·categoryName, U2의 T9 없음', async () => {
    const res = await u1.get(`/api/todos?today=${TODAY}`);
    assert.equal(res.status, 200);
    assert.deepEqual(titles(res), ['T1', 'T4', 'T2', 'T3']);
    assert.deepEqual(
      res.body.map((t) => [t.status, t.categoryName]),
      [
        ['overdue', '업무'],
        ['completed', '기본'],
        ['in_progress', '학습'],
        ['not_started', '기본'],
      ],
    );
  });

  test('BR-15 카테고리 단독·상태 단독·AND 결합', async () => {
    assert.deepEqual(titles(await u1.get(`/api/todos?today=${TODAY}&categoryId=${cats.업무}`)), [
      'T1',
    ]);
    assert.deepEqual(titles(await u1.get(`/api/todos?today=${TODAY}&status=in_progress`)), ['T2']);
    assert.deepEqual(
      titles(await u1.get(`/api/todos?today=${TODAY}&categoryId=${cats.기본}&status=not_started`)),
      ['T3'],
    );
  });

  test('E-08-1 today 누락·2026-13-01은 400, E-08-3 잘못된 status는 400', async () => {
    for (const q of ['', '?today=2026-13-01', `?today=${TODAY}&status=done`]) {
      const res = await u1.get(`/api/todos${q}`);
      assert.equal(res.status, 400, q);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    }
  });

  test('E-08-2 U2의 카테고리·없는 카테고리 필터는 404, PD-13 categoryId=abc는 400', async () => {
    for (const id of [cats.C9, 999999]) {
      const res = await u1.get(`/api/todos?today=${TODAY}&categoryId=${id}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    }
    const abc = await u1.get(`/api/todos?today=${TODAY}&categoryId=abc`);
    assert.equal(abc.status, 400);
    assert.equal(abc.body.error.code, 'VALIDATION_ERROR');
  });

  test('PR-L-08 요청 하나에 SQL 2개 이하(카테고리 확인 + 목록)', async (t) => {
    const spy = t.mock.method(pg.Pool.prototype, 'query');
    await u1.get(`/api/todos?today=${TODAY}&categoryId=${cats.기본}`);
    assert.ok(spy.mock.callCount() <= 2, `SQL ${spy.mock.callCount()}개`);
    spy.mock.resetCalls();
    await u1.get(`/api/todos?today=${TODAY}`);
    assert.equal(spy.mock.callCount(), 1);
  });

  test('BR-20 종료일이 같으면 created_at 순, 그것도 같으면 id 순', async () => {
    const u = await signupUser(ctx, 22);
    const add = async (title) =>
      (await u.post('/api/todos', { title, startDate: '2026-11-01', endDate: '2026-11-09' })).body
        .id;
    const a = await add('A');
    const b = await add('B');
    const c = await add('C');
    // C를 가장 이르게, A·B는 같은 시각으로 맞춘다 → C, A, B
    await query("UPDATE todos SET created_at = '2026-01-01T00:00:00Z' WHERE id = $1", [c]);
    await query("UPDATE todos SET created_at = '2026-02-01T00:00:00Z' WHERE id = ANY($1)", [
      [a, b],
    ]);
    assert.deepEqual(titles(await u.get(`/api/todos?today=${TODAY}`)), ['C', 'A', 'B']);
  });
});
