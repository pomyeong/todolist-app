import { Link, useLocation } from 'react-router';
import type { TodoWithStatus } from '../../api/types';
import { STATUS_LABEL } from '../../api/types';
import { WEEKDAYS } from '../../lib/date';
import { cellSummary } from './cellTodos';
import styles from './MonthGrid.module.css';
import { monthCells } from './range';

interface Props {
  date: string;
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

export function MonthGrid({ date, todos, today, selected, onSelect }: Props) {
  const { pathname, search } = useLocation();
  return (
    <div className={styles.grid}>
      {WEEKDAYS.map((w) => (
        <div key={w} className={styles.weekday}>
          {w}
        </div>
      ))}
      {monthCells(date).map((d, i) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: 채움 칸은 날짜가 없고 위치가 고정이라 인덱스가 안정적인 키다
        if (d === null) return <div key={`blank-${i}`} className={styles.blank} />;
        const { shown, more } = cellSummary(todos, d);
        return (
          <div
            key={d}
            className={styles.cell}
            data-selected={d === selected}
            data-today={d === today}
          >
            <button
              type="button"
              className={styles.day}
              data-today={d === today}
              data-dow={i % 7}
              aria-label={d}
              onClick={() => onSelect(d)}
            >
              {Number(d.slice(8))}
            </button>
            <ul className={styles.items}>
              {shown.map((t) => (
                <li key={t.id} className={styles.item} data-status={t.status}>
                  <Link
                    to={`/todos/${t.id}/edit`}
                    state={{ from: pathname + search }}
                    className={styles.title}
                  >
                    {t.title}
                  </Link>
                  <span className={styles.status}>({STATUS_LABEL[t.status]})</span>
                </li>
              ))}
            </ul>
            {more > 0 && (
              <button type="button" className={styles.more} onClick={() => onSelect(d)}>
                +{more}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
