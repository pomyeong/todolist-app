// 할일 상태(ST-01~04) 판정은 여기 한 곳(NFR-12). 상태 문자열은 이 파일에만 둔다(PR-C-01).
export const STATUS = Object.freeze({
  COMPLETED: 'completed',
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  OVERDUE: 'overdue',
});
export const STATUS_VALUES = Object.values(STATUS); // PD-19

// 날짜는 'YYYY-MM-DD' 문자열이라 사전순 비교가 날짜 비교와 같다.
export function deriveStatus(todo, today) {
  if (todo.completed) return STATUS.COMPLETED; // ST-01: 날짜와 무관하게 완료 우선
  if (today < todo.startDate) return STATUS.NOT_STARTED; // ST-02
  if (today > todo.endDate) return STATUS.OVERDUE; // ST-04
  return STATUS.IN_PROGRESS; // ST-03: 시작일·종료일 당일 포함
}

// 상태를 붙이고, status가 있으면 그 상태만 남긴다(PD-17).
export function withStatus(todos, today, status) {
  const result = todos.map((t) => ({ ...t, status: deriveStatus(t, today) }));
  return status ? result.filter((t) => t.status === status) : result;
}
