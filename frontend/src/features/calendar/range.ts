import { addDays, addMonths, dayOfWeek, endOfMonth, startOfMonth } from '../../lib/date';

export type CalendarView = 'month' | 'week' | 'day';
export interface DateRange {
  from: string;
  to: string;
}

// BR-16: 월=1일~말일, 주=일~토, 일=하루
export function rangeOf(view: CalendarView, date: string): DateRange {
  if (view === 'month') return { from: startOfMonth(date), to: endOfMonth(date) };
  if (view === 'week') {
    const from = addDays(date, -dayOfWeek(date));
    return { from, to: addDays(from, 6) };
  }
  return { from: date, to: date };
}

// PD-23: 앞뒤 채움 칸은 null, 길이는 7의 배수
export function monthCells(date: string): (string | null)[] {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const cells: (string | null)[] = Array<null>(dayOfWeek(first)).fill(null);
  for (let d = first; d <= last; d = addDays(d, 1)) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function weekDays(date: string): string[] {
  const from = addDays(date, -dayOfWeek(date));
  return Array.from({ length: 7 }, (_, i) => addDays(from, i));
}

export function shiftDate(view: CalendarView, date: string, step: 1 | -1): string {
  if (view === 'month') return addMonths(date, step);
  return addDays(date, view === 'week' ? 7 * step : step);
}

// P-20: 선택일이 기간 밖이면 오늘, 오늘도 밖이면 없음
export function pickSelected(
  selected: string | null,
  today: string,
  range: DateRange,
): string | null {
  const inRange = (d: string) => d >= range.from && d <= range.to;
  if (selected !== null && inRange(selected)) return selected;
  return inRange(today) ? today : null;
}
