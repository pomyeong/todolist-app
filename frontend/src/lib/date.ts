export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// PR-C-05: 로컬 날짜 컴포넌트만 사용, toISOString 금지
function format(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function parse(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y, m, d];
}

export function todayLocal(): string {
  return format(new Date());
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = parse(date);
  return format(new Date(y, m - 1, d + n));
}

// PD-10: 일은 그 달 말일로 클램프
export function addMonths(date: string, n: number): string {
  const [y, m, d] = parse(date);
  const lastDay = new Date(y, m - 1 + n + 1, 0).getDate();
  return format(new Date(y, m - 1 + n, Math.min(d, lastDay)));
}

export function startOfMonth(date: string): string {
  const [y, m] = parse(date);
  return format(new Date(y, m - 1, 1));
}

export function endOfMonth(date: string): string {
  const [y, m] = parse(date);
  return format(new Date(y, m, 0));
}

export function dayOfWeek(date: string): number {
  const [y, m, d] = parse(date);
  return new Date(y, m - 1, d).getDay();
}
