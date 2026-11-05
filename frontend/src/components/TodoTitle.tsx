import { emojiFor } from '../lib/emoji';

// P-26·P-27, L-19·L-20: 이모지 → 시작 시간 → 제목. 목록 행·그날 목록·캘린더 막대가 함께 쓴다.
export function TodoTitle({ title, startTime }: { title: string; startTime?: string | null }) {
  return (
    <>
      <span className="todo-emoji" aria-hidden="true">
        {emojiFor(title)}
      </span>
      {startTime && <span className="todo-time">{startTime}</span>}
      {title}
    </>
  );
}
