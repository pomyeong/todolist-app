type Dated = { startDate: string; endDate: string };

export const CELL_LIMIT = 3;

// BR-17: start <= date <= end, 입력(서버) 순서 유지
export function todosOn<T extends Dated>(todos: T[], date: string): T[] {
  return todos.filter((t) => t.startDate <= date && date <= t.endDate);
}

// BR-18: 칸당 3건 + 나머지 +N
export function cellSummary<T extends Dated>(
  todos: T[],
  date: string,
): { shown: T[]; more: number } {
  const all = todosOn(todos, date);
  return { shown: all.slice(0, CELL_LIMIT), more: Math.max(0, all.length - CELL_LIMIT) };
}
