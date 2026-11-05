import { describe, expect, it } from 'vitest';
import { CELL_LIMIT, cellSummary, todosOn } from './cellTodos';
import { monthCells } from './range';

type Item = { id: string; startDate: string; endDate: string };

const T1: Item = { id: 'T1', startDate: '2026-10-28', endDate: '2026-11-03' };
const T4: Item = { id: 'T4', startDate: '2026-11-04', endDate: '2026-11-04' };
const T2: Item = { id: 'T2', startDate: '2026-11-02', endDate: '2026-11-10' };
const T3: Item = { id: 'T3', startDate: '2026-11-20', endDate: '2026-12-02' };
// 서버 순서
const todos: Item[] = [T1, T4, T2, T3];

const daysWith = (cells: (string | null)[], item: Item): string[] =>
  cells.filter((d): d is string => d !== null && todosOn(todos, d).includes(item));

describe('todosOn', () => {
  it.each<[string, Item[]]>([
    ['2026-11-01', [T1]],
    ['2026-11-03', [T1, T2]],
    ['2026-11-04', [T4, T2]],
    ['2026-11-11', []],
    ['2026-11-20', [T3]],
    ['2026-11-30', [T3]],
    ['2026-10-27', []],
  ])('%s', (date, expected) => {
    expect(todosOn(todos, date)).toEqual(expected);
  });

  it('BR-16 11월 격자에서 T1은 11-01, 11-02, 11-03 칸에만 들어간다', () => {
    expect(daysWith(monthCells('2026-11-04'), T1)).toEqual([
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
    ]);
  });

  it('BR-16 12월 격자에서 T3은 12-01, 12-02 칸에만 들어간다', () => {
    expect(daysWith(monthCells('2026-12-10'), T3)).toEqual(['2026-12-01', '2026-12-02']);
  });

  it('BR-20 입력 순서를 그대로 유지한다', () => {
    const A: Item = { id: 'A', startDate: '2026-11-01', endDate: '2026-11-05' };
    const B: Item = { id: 'B', startDate: '2026-11-03', endDate: '2026-11-03' };
    expect(todosOn([B, A], '2026-11-03')).toEqual([B, A]);
  });
});

describe('cellSummary', () => {
  const day = '2026-11-04';
  const make = (n: number): Item[] =>
    Array.from({ length: n }, (_, i) => ({ id: `X${i}`, startDate: day, endDate: day }));

  it('CELL_LIMIT은 3', () => {
    expect(CELL_LIMIT).toBe(3);
  });

  it('5건 → 앞 3건 표시, more 2', () => {
    const items = make(5);
    expect(cellSummary(items, day)).toEqual({ shown: items.slice(0, 3), more: 2 });
  });

  it('4건 → more 1', () => {
    expect(cellSummary(make(4), day).more).toBe(1);
  });

  it('3건 → 모두 표시, more 0', () => {
    const items = make(3);
    expect(cellSummary(items, day)).toEqual({ shown: items, more: 0 });
  });

  it('0건 → shown [], more 0', () => {
    expect(cellSummary([], day)).toEqual({ shown: [], more: 0 });
  });

  it('그 날짜에 걸치지 않는 할일은 세지 않는다', () => {
    expect(cellSummary(todos, '2026-11-04')).toEqual({ shown: [T4, T2], more: 0 });
  });
});
