import assert from 'node:assert/strict';
import { test } from 'node:test';
import pg from 'pg';
import { signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const TODAY = '2026-11-04';
let u1;

test('준비: 시나리오 3.0 예시 데이터(T1~T4)와 U2의 T9', async () => {
  u1 = await signupUser(ctx, 1);
  const u2 = await signupUser(ctx, 2);
  const add = async (c, title, s, e) =>
    (await c.post('/api/todos', { title, startDate: s, endDate: e })).body.id;
  await add(u1, 'T1', '2026-10-28', '2026-11-03');
  await add(u1, 'T2', '2026-11-02', '2026-11-10');
  await add(u1, 'T3', '2026-11-20', '2026-12-02');
  const t4 = await add(u1, 'T4', '2026-11-04', '2026-11-04');
  await u1.patch(`/api/todos/${t4}/completed`, { completed: true });
  await add(u2, 'T9', '2026-11-04', '2026-11-04');
});

const cal = (from, to, today = TODAY) =>
  u1.get(`/api/calendar?from=${from}&to=${to}&today=${today}`);
const titles = async (from, to) => (await cal(from, to)).body.map((t) => t.title);

test('BR-17 월(11-01~11-30)에 월 경계 걸친 T1·T3 포함, BR-20 순서, U2의 T9 없음', async () => {
  assert.deepEqual(await titles('2026-11-01', '2026-11-30'), ['T1', 'T4', 'T2', 'T3']);
});

test('BR-17 주(11-01~11-07)에 T1·T2·T4, T3 없음. 주(10-25~10-31)에 T1', async () => {
  assert.deepEqual(await titles('2026-11-01', '2026-11-07'), ['T1', 'T4', 'T2']);
  assert.deepEqual(await titles('2026-10-25', '2026-10-31'), ['T1']);
});

test('BR-18 일(11-04)에 T2·T4, T1 없음. 일(11-03)에 T1(당일 포함)', async () => {
  assert.deepEqual(await titles('2026-11-04', '2026-11-04'), ['T4', 'T2']);
  assert.ok((await titles('2026-11-03', '2026-11-03')).includes('T1'));
});

test('BR-19 완료된 T4가 completed 상태로 포함', async () => {
  const res = await cal('2026-11-04', '2026-11-04');
  assert.equal(res.body.find((t) => t.title === 'T4').status, 'completed');
});

test('E-09-1 E-09-2 from·to·today 형식 오류, from > to는 400 VALIDATION_ERROR', async () => {
  for (const [f, t, d] of [
    ['2026-11-31', '2026-12-01', TODAY],
    ['2026-11-01', 'bad', TODAY],
    ['2026-11-01', '2026-11-30', '2026-13-01'],
    ['2026-11-30', '2026-11-01', TODAY],
  ]) {
    const res = await cal(f, t, d);
    assert.equal(res.status, 400, `${f} ${t} ${d}`);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  }
});

test('PR-L-08 요청당 SQL 1개', async (t) => {
  const spy = t.mock.method(pg.Pool.prototype, 'query');
  await cal('2026-11-01', '2026-11-30');
  assert.equal(spy.mock.callCount(), 1);
});
