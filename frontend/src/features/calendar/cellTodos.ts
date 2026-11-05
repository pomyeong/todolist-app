type Dated = { startDate: string; endDate: string };

export const CELL_LIMIT = 3;

// BR-16: start <= date <= end, 입력(서버, BR-20) 순서 유지
export function todosOn<T extends Dated>(todos: T[], date: string): T[] {
  return todos.filter((t) => t.startDate <= date && date <= t.endDate);
}

export interface Bar<T> {
  todo: T;
  start: number; // 주 안 칸 번호 0~6
  span: number;
  lane: number; // 0~CELL_LIMIT-1
  fromPrev: boolean; // 이 줄 앞(지난 주·지난 달)에서 이어짐
  toNext: boolean; // 이 줄 뒤로 이어짐
}

// P-16: 한 주(7칸)에 기간을 잇는 막대를 배치한다. days의 null은 다른 달 칸이라 막대를 놓지 않는다.
// 줄 배정은 시작 칸 → 긴 기간 → 입력(BR-20) 순으로, 비어 있는 가장 위 줄. 넘친 할일은 날짜별 +N.
export function weekBars<T extends Dated>(
  days: (string | null)[],
  todos: T[],
  limit = CELL_LIMIT,
): { bars: Bar<T>[]; more: number[] } {
  const segs: Omit<Bar<T>, 'lane'>[] = [];
  for (const todo of todos) {
    const start = days.findIndex((d) => d !== null && todo.startDate <= d && d <= todo.endDate);
    if (start < 0) continue;
    let end = start;
    while (
      end + 1 < days.length &&
      days[end + 1] !== null &&
      (days[end + 1] as string) <= todo.endDate
    )
      end++;
    segs.push({
      todo,
      start,
      span: end - start + 1,
      fromPrev: todo.startDate < (days[start] as string),
      toNext: todo.endDate > (days[end] as string),
    });
  }
  segs.sort((a, b) => a.start - b.start || b.span - a.span); // 안정 정렬이라 같으면 BR-20 순서 유지

  const used: boolean[][] = [];
  const more = Array<number>(days.length).fill(0);
  const bars: Bar<T>[] = [];
  for (const seg of segs) {
    const cols = Array.from({ length: seg.span }, (_, i) => seg.start + i);
    let lane = 0;
    while (cols.some((c) => used[lane]?.[c])) lane++;
    used[lane] ??= [];
    for (const c of cols) used[lane][c] = true;
    if (lane < limit) bars.push({ ...seg, lane });
    else for (const c of cols) more[c]++;
  }
  return { bars, more };
}
