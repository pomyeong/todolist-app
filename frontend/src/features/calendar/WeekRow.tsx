import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import type { TodoWithStatus } from '../../api/types';
import { STATUS_LABEL } from '../../api/types';
import { TodoTitle } from '../../components/TodoTitle';
import { addDays, isoWeek } from '../../lib/date';
import { CELL_LIMIT, weekBars } from './cellTodos';
import styles from './WeekRow.module.css';

interface Props {
  days: (string | null)[]; // 7칸, null은 다른 달(월 뷰)
  alt?: boolean; // P-28 월 뷰 짝수째 주 바탕
  label(d: string, i: number): string;
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

// P-16: 데스크톱 월·주 뷰의 한 주. 칸 배경·날짜·'+N'과 기간을 잇는 막대를 한 격자에 겹쳐 그린다.
export function WeekRow({ days, alt = false, label, todos, today, selected, onSelect }: Props) {
  const { pathname, search } = useLocation();
  const { bars, more } = weekBars(days, todos);
  const at = (col: number, row: string): CSSProperties => ({ gridColumn: col + 1, gridRow: row });
  // P-28: 일~토 한 줄의 주차는 그 주 월요일의 ISO 주차. 일요일 칸이 다른 달이어도 날짜는 계산한다.
  const first = days.findIndex((d) => d !== null);
  const week = isoWeek(addDays(days[first] as string, 1 - first));
  return (
    <div className={styles.week} data-alt={alt}>
      {days.map((d, i) =>
        d === null ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 다른 달 칸은 날짜가 없고 위치가 고정이라 인덱스가 안정적인 키다
          <div key={`blank-${i}`} className={styles.blank} style={at(i, '1 / -1')} />
        ) : (
          <div
            key={d}
            className={styles.cell}
            style={at(i, '1 / -1')}
            data-today={d === today}
            data-selected={d === selected}
          />
        ),
      )}
      {days.map(
        (d, i) =>
          d !== null && (
            <button
              key={`day-${d}`}
              type="button"
              className={styles.day}
              style={at(i, '1')}
              data-today={d === today}
              data-dow={i}
              aria-label={d}
              onClick={() => onSelect(d)}
            >
              {label(d, i)}
            </button>
          ),
      )}
      {bars.map(({ todo, start, span, lane, fromPrev, toNext }) => (
        <Link
          key={todo.id}
          to={`/todos/${todo.id}/edit`}
          state={{ from: pathname + search }}
          className={styles.bar}
          style={{ gridColumn: `${start + 1} / span ${span}`, gridRow: lane + 2 }}
          data-status={todo.status}
          data-from-prev={fromPrev}
          data-to-next={toNext}
        >
          <span className={styles.title}>
            {/* 지난 주에서 이어지는 줄에는 시작 시간을 쓰지 않는다(P-26) */}
            <TodoTitle title={todo.title} startTime={fromPrev ? null : todo.startTime} />
          </span>
          <span className={styles.status}>({STATUS_LABEL[todo.status]})</span>
        </Link>
      ))}
      <span className={styles.weekNo} style={at(0, String(CELL_LIMIT + 2))}>
        {week}주차
      </span>
      {days.map(
        (d, i) =>
          d !== null &&
          more[i] > 0 && (
            <button
              key={`more-${d}`}
              type="button"
              className={styles.more}
              style={at(i, String(CELL_LIMIT + 2))}
              onClick={() => onSelect(d)}
            >
              +{more[i]}
            </button>
          ),
      )}
    </div>
  );
}
