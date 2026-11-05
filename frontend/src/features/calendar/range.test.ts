import { describe, expect, it } from 'vitest';
import type { CalendarView, DateRange } from './range';
import { monthCells, pickSelected, rangeOf, shiftDate, weekDays } from './range';

describe('rangeOf', () => {
  it.each<[CalendarView, string, DateRange]>([
    ['month', '2026-11-04', { from: '2026-11-01', to: '2026-11-30' }],
    ['month', '2026-02-15', { from: '2026-02-01', to: '2026-02-28' }],
    ['month', '2028-02-03', { from: '2028-02-01', to: '2028-02-29' }],
    ['week', '2026-11-04', { from: '2026-11-01', to: '2026-11-07' }],
    ['week', '2026-10-31', { from: '2026-10-25', to: '2026-10-31' }],
    ['week', '2026-11-01', { from: '2026-11-01', to: '2026-11-07' }],
    ['week', '2026-12-01', { from: '2026-11-29', to: '2026-12-05' }],
    ['week', '2027-01-01', { from: '2026-12-27', to: '2027-01-02' }],
    ['day', '2026-11-04', { from: '2026-11-04', to: '2026-11-04' }],
  ])('rangeOf(%s, %s)', (view, date, expected) => {
    expect(rangeOf(view, date)).toEqual(expected);
  });
});

describe('monthCells (PD-23)', () => {
  it('2026-11: 일요일 시작, 35칸, 뒤 5칸 null', () => {
    const cells = monthCells('2026-11-04');
    expect(cells).toHaveLength(35);
    expect(cells[0]).toBe('2026-11-01');
    expect(cells[29]).toBe('2026-11-30');
    expect(cells.slice(30)).toEqual([null, null, null, null, null]);
  });

  it('2026-12: 앞 2칸 null, 35칸, 마지막 2칸 null', () => {
    const cells = monthCells('2026-12-10');
    expect(cells).toHaveLength(35);
    expect(cells[0]).toBeNull();
    expect(cells[1]).toBeNull();
    expect(cells[2]).toBe('2026-12-01');
    expect(cells[32]).toBe('2026-12-31');
    expect(cells.slice(33)).toEqual([null, null]);
  });

  it('2026-02: 28칸, null 없음', () => {
    const cells = monthCells('2026-02-01');
    expect(cells).toHaveLength(28);
    expect(cells).not.toContain(null);
    expect(cells[0]).toBe('2026-02-01');
    expect(cells[27]).toBe('2026-02-28');
  });

  it('2026-08: 42칸', () => {
    expect(monthCells('2026-08-01')).toHaveLength(42);
  });

  it.each(['2026-11-04', '2026-12-10', '2026-02-01', '2026-08-01', '2028-02-03'])(
    '%s 길이는 7의 배수',
    (date) => {
      expect(monthCells(date).length % 7).toBe(0);
    },
  );
});

describe('weekDays', () => {
  it('2026-11-04 → 11-01..11-07', () => {
    expect(weekDays('2026-11-04')).toEqual([
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
    ]);
  });
});

describe('shiftDate', () => {
  it.each<[CalendarView, string, 1 | -1, string]>([
    ['month', '2026-12-04', 1, '2027-01-04'],
    ['month', '2026-01-04', -1, '2025-12-04'],
    ['week', '2026-11-04', -1, '2026-10-28'],
    ['week', '2026-11-04', 1, '2026-11-11'],
    ['day', '2026-11-30', 1, '2026-12-01'],
    ['day', '2026-11-30', -1, '2026-11-29'],
  ])('shiftDate(%s, %s, %i) → %s', (view, date, step, expected) => {
    expect(shiftDate(view, date, step)).toBe(expected);
  });
});

describe('pickSelected (P-20)', () => {
  const nov: DateRange = { from: '2026-11-01', to: '2026-11-30' };
  const dec: DateRange = { from: '2026-12-01', to: '2026-12-31' };

  it.each<[string | null, string, DateRange, string | null]>([
    [null, '2026-11-04', nov, '2026-11-04'],
    ['2026-11-15', '2026-11-04', nov, '2026-11-15'],
    ['2026-11-15', '2026-11-04', dec, null],
    ['2026-12-05', '2026-11-04', nov, '2026-11-04'],
    [null, '2026-11-04', dec, null],
  ])('selected=%s today=%s → %s', (selected, today, range, expected) => {
    expect(pickSelected(selected, today, range)).toBe(expected);
  });
});
