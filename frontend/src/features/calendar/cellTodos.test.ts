import { describe, expect, it } from 'vitest';
import { CELL_LIMIT, todosOn, weekBars } from './cellTodos';
import { monthCells, weekDays } from './range';

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

describe('weekBars (P-16)', () => {
  const week1 = weekDays('2026-11-04'); // 11-01(일) ~ 11-07(토)
  const M = (id: string, startDate: string, endDate: string): Item => ({ id, startDate, endDate });
  const pick = (r: ReturnType<typeof weekBars<Item>>) =>
    r.bars.map(
      (b) =>
        `${b.todo.id}@${b.start}+${b.span}L${b.lane}${b.fromPrev ? '<' : ''}${b.toNext ? '>' : ''}`,
    );

  it('CELL_LIMIT은 3', () => {
    expect(CELL_LIMIT).toBe(3);
  });

  it('시나리오 3.0 첫 주: T1은 앞에서 이어지고, T2는 다음 주로 이어지는 하나의 막대', () => {
    expect(pick(weekBars(week1, todos))).toEqual(['T1@0+3L0<', 'T2@1+6L1>', 'T4@3+1L0']);
  });

  it('A-09-2: 11-04에 회의·운동을 더하면 장보기·시험 공부·회의 3줄, 운동은 11-04만 +1', () => {
    const r = weekBars(week1, [
      T1,
      T4,
      M('회의', '2026-11-04', '2026-11-04'),
      M('운동', '2026-11-04', '2026-11-04'),
      T2,
    ]);
    expect(pick(r)).toEqual(['T1@0+3L0<', 'T2@1+6L1>', 'T4@3+1L0', '회의@3+1L2']);
    expect(r.more).toEqual([0, 0, 0, 1, 0, 0, 0]);
  });

  it('긴 기간이 먼저 위 줄을 잡아 막대가 끊기지 않는다(같은 시작 칸)', () => {
    const short = M('S', '2026-11-02', '2026-11-02');
    const long = M('L', '2026-11-02', '2026-11-06');
    expect(pick(weekBars(week1, [short, long]))).toEqual(['L@1+5L0', 'S@1+1L1']);
  });

  it('겹치지 않으면 같은 줄을 다시 쓴다', () => {
    const a = M('A', '2026-11-01', '2026-11-02');
    const b = M('B', '2026-11-04', '2026-11-05');
    expect(pick(weekBars(week1, [a, b]))).toEqual(['A@0+2L0', 'B@3+2L0']);
  });

  it('월 뷰의 다른 달 칸(null)에는 막대를 놓지 않는다: 12월 첫 주의 T3은 12-01~12-02만', () => {
    const dec = monthCells('2026-12-10').slice(0, 7); // [null, 12-01 ... 12-05]
    expect(pick(weekBars(dec, todos))).toEqual(['T3@2+2L0<']);
  });

  it('11월 마지막 주: T3은 11-29~11-30까지 그리고 다음 달로 이어짐 표시', () => {
    const last = monthCells('2026-11-04').slice(28, 35); // 11-29, 11-30, null x5
    expect(pick(weekBars(last, todos))).toEqual(['T3@0+2L0<>']);
  });

  it('줄이 넘친 할일은 그 할일이 걸친 날짜에만 +N', () => {
    const items = ['A', 'B', 'C', 'D'].map((id) => M(id, '2026-11-02', '2026-11-03'));
    const r = weekBars(week1, items);
    expect(r.bars).toHaveLength(3);
    expect(r.more).toEqual([0, 1, 1, 0, 0, 0, 0]);
  });

  it('겹치는 할일이 없으면 빈 결과', () => {
    expect(weekBars(week1, [T3])).toEqual({ bars: [], more: [0, 0, 0, 0, 0, 0, 0] });
  });
});
