import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveStatus, STATUS, withStatus } from '../../src/domain/status.js';

const TODAY = '2026-11-04';
// 시나리오 3.0 예시 데이터
const T1 = { startDate: '2026-10-28', endDate: '2026-11-03', completed: false };
const T2 = { startDate: '2026-11-02', endDate: '2026-11-10', completed: false };
const T3 = { startDate: '2026-11-20', endDate: '2026-12-02', completed: false };
const T4 = { startDate: '2026-11-04', endDate: '2026-11-04', completed: true };

test('ST-01~04 시나리오 3.0: T1 지연, T2 진행 중, T3 시작 전, T4 완료', () => {
  assert.equal(deriveStatus(T1, TODAY), STATUS.OVERDUE);
  assert.equal(deriveStatus(T2, TODAY), STATUS.IN_PROGRESS);
  assert.equal(deriveStatus(T3, TODAY), STATUS.NOT_STARTED);
  assert.equal(deriveStatus(T4, TODAY), STATUS.COMPLETED);
});

test('ST-03 시작일 당일·종료일 당일은 진행 중', () => {
  const t = { startDate: '2026-11-04', endDate: '2026-11-10', completed: false };
  assert.equal(deriveStatus(t, '2026-11-04'), STATUS.IN_PROGRESS);
  assert.equal(deriveStatus(t, '2026-11-10'), STATUS.IN_PROGRESS);
  assert.equal(deriveStatus(t, '2026-11-11'), STATUS.OVERDUE);
  assert.equal(deriveStatus(t, '2026-11-03'), STATUS.NOT_STARTED);
});

test('ST-01 종료일이 지났거나 시작 전이어도 완료면 완료(완료 우선)', () => {
  assert.equal(deriveStatus({ ...T1, completed: true }, TODAY), STATUS.COMPLETED);
  assert.equal(deriveStatus({ ...T3, completed: true }, TODAY), STATUS.COMPLETED);
});

test('A-06-1 완료 취소하면 날짜 규칙으로 다시 판정(T1 → 지연)', () => {
  const done = { ...T1, completed: true };
  assert.equal(deriveStatus({ ...done, completed: false }, TODAY), STATUS.OVERDUE);
});

test('PD-17 withStatus는 상태를 붙이고 status로 거른다', () => {
  const all = withStatus([T1, T2, T3, T4], TODAY);
  assert.deepEqual(
    all.map((t) => t.status),
    [STATUS.OVERDUE, STATUS.IN_PROGRESS, STATUS.NOT_STARTED, STATUS.COMPLETED],
  );
  assert.equal(withStatus([T1, T2, T3, T4], TODAY, STATUS.IN_PROGRESS).length, 1);
});
