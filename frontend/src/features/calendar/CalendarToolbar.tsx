import { dayOfWeek, WEEKDAYS } from '../../lib/date';
import styles from './CalendarToolbar.module.css';
import type { CalendarView } from './range';
import { rangeOf, shiftDate } from './range';

interface Props {
  view: CalendarView;
  date: string;
  onChange(view: CalendarView, date: string): void;
}

const VIEWS: { view: CalendarView; label: string }[] = [
  { view: 'month', label: '월' },
  { view: 'week', label: '주' },
  { view: 'day', label: '일' },
];

function periodLabel(view: CalendarView, date: string): string {
  if (view === 'month') return date.slice(0, 7);
  if (view === 'day') return `${date} (${WEEKDAYS[dayOfWeek(date)]})`;
  const { from, to } = rangeOf(view, date);
  return `${from} ~ ${to}`;
}

export function CalendarToolbar({ view, date, onChange }: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.segments}>
        {VIEWS.map((v) => (
          <button
            key={v.view}
            type="button"
            className={styles.segment}
            aria-pressed={v.view === view}
            onClick={() => onChange(v.view, date)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.step}
          aria-label="이전"
          onClick={() => onChange(view, shiftDate(view, date, -1))}
        >
          ‹
        </button>
        <span className={styles.label}>{periodLabel(view, date)}</span>
        <button
          type="button"
          className={styles.step}
          aria-label="다음"
          onClick={() => onChange(view, shiftDate(view, date, 1))}
        >
          ›
        </button>
      </div>
    </div>
  );
}
