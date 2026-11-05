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

// 형식이 맞고 달력에 실제로 있는 날짜인지(2026-13-45, 2026-02-30 거부). 없는 날짜는 Date가 다른 날로 넘기므로 왕복 비교
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && addDays(date, 0) === date;
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

// P-28: ISO 8601 연중 주차(월요일 시작, 그 주 목요일이 속한 해 기준). UTC 일수 차로 서머타임 영향 없음
export function isoWeek(date: string): number {
  const thursday = addDays(date, 4 - (dayOfWeek(date) || 7));
  const [y, m, d] = parse(thursday);
  const ordinal = (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000;
  return Math.floor(ordinal / 7) + 1;
}
