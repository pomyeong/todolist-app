import { emojiFor } from '../lib/emoji';

// P-26·P-27, L-19·L-20: 이모지 → 시작 시간 → 제목. 목록 행·그날 목록·캘린더 막대가 함께 쓴다.
interface Props {
  title: string;
  description?: string | null; // P-27: 제목에 맞는 단어가 없을 때 이모지를 고르는 보조 단서
  startTime?: string | null;
}

export function TodoTitle({ title, description, startTime }: Props) {
  return (
    <>
      <span className="todo-emoji" aria-hidden="true">
        {emojiFor(title, description)}
      </span>
      {startTime && <span className="todo-time">{startTime}</span>}
      {title}
    </>
  );
}
