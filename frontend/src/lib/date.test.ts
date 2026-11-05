import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  addMonths,
  dayOfWeek,
  endOfMonth,
  startOfMonth,
  todayLocal,
  WEEKDAYS,
} from './date';

describe('addDays', () => {
  it.each([
    ['2026-10-31', 1, '2026-11-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2028-02-28', 1, '2028-02-29'],
    ['2028-02-29', 1, '2028-03-01'],
    ['2028-03-01', -1, '2028-02-29'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-01-09', 1, '2026-01-10'],
    ['2026-11-04', 0, '2026-11-04'],
  ])('addDays(%s, %i) → %s', (date, n, expected) => {
    expect(addDays(date, n)).toBe(expected);
  });
});

describe('endOfMonth', () => {
  it.each([
    ['2026-02-10', '2026-02-28'],
    ['2028-02-01', '2028-02-29'],
    ['2026-04-15', '2026-04-30'],
    ['2026-11-04', '2026-11-30'],
    ['2026-12-01', '2026-12-31'],
  ])('endOfMonth(%s) → %s', (date, expected) => {
    expect(endOfMonth(date)).toBe(expected);
  });
});

describe('startOfMonth', () => {
  it('startOfMonth(2026-11-30) → 2026-11-01', () => {
    expect(startOfMonth('2026-11-30')).toBe('2026-11-01');
  });
});

describe('addMonths', () => {
  it.each([
    ['2026-12-04', 1, '2027-01-04'],
    ['2026-01-04', -1, '2025-12-04'],
    ['2026-01-31', 1, '2026-02-28'],
    ['2028-01-31', 1, '2028-02-29'],
    ['2026-03-31', -1, '2026-02-28'],
  ])('addMonths(%s, %i) → %s', (date, n, expected) => {
    expect(addMonths(date, n)).toBe(expected);
  });
});

describe('dayOfWeek', () => {
  it.each([
    ['2026-11-01', 0],
    ['2026-11-04', 3],
    ['2026-10-31', 6],
    ['2026-12-01', 2],
  ])('dayOfWeek(%s) → %i', (date, expected) => {
    expect(dayOfWeek(date)).toBe(expected);
  });
});

describe('todayLocal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [new Date(2026, 10, 4, 23, 59, 59), '2026-11-04'],
    [new Date(2026, 10, 5, 0, 0, 0), '2026-11-05'],
    [new Date(2026, 0, 5), '2026-01-05'],
  ])('로컬 시각 %s → %s', (now, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    expect(todayLocal()).toBe(expected);
  });
});

describe('WEEKDAYS', () => {
  it('일요일부터 7개', () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe('일');
  });
});
