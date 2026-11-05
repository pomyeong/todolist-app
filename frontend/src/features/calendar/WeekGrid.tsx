import { Link, useLocation } from 'react-router';
import type { TodoWithStatus } from '../../api/types';
import { STATUS_LABEL } from '../../api/types';
import { WEEKDAYS } from '../../lib/date';
import { cellSummary } from './cellTodos';
import { weekDays } from './range';
import styles from './WeekGrid.module.css';

interface Props {
  date: string;
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

export function WeekGrid({ date, todos, today, selected, onSelect }: Props) {
  const { pathname, search } = useLocation();
  return (
    <div className={styles.grid}>
      {weekDays(date).map((d, i) => {
        const { shown, more } = cellSummary(todos, d);
        return (
          <div key={d} className={styles.cell} data-selected={d === selected}>
            <button
              type="button"
              className={styles.day}
              data-today={d === today}
              data-dow={i}
              aria-label={d}
              onClick={() => onSelect(d)}
            >
              {WEEKDAYS[i]} {d.slice(5)}
            </button>
            <ul className={styles.items}>
              {shown.map((t) => (
                <li key={t.id} className={styles.item}>
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
