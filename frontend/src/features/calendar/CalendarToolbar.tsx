import { useT } from '../../i18n';
import { dayOfWeek } from '../../lib/date';
import styles from './CalendarToolbar.module.css';
import type { CalendarView } from './range';
import { rangeOf, shiftDate } from './range';

interface Props {
  view: CalendarView;
  date: string;
  onChange(view: CalendarView, date: string): void;
}

const VIEWS = [
  { view: 'month', label: 'cal.month' },
  { view: '4weeks', label: 'cal.4weeks' },
  { view: 'week', label: 'cal.week' },
  { view: 'day', label: 'cal.day' },
] as const;

function periodLabel(view: CalendarView, date: string, weekdays: readonly string[]): string {
  if (view === 'month') return date.slice(0, 7);
  if (view === 'day') return `${date} (${weekdays[dayOfWeek(date)]})`;
  const { from, to } = rangeOf(view, date);
  return `${from} ~ ${to}`;
}

export function CalendarToolbar({ view, date, onChange }: Props) {
  const t = useT();
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
            {t(v.label)}
          </button>
        ))}
      </div>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.step}
          aria-label={t('cal.prev')}
          onClick={() => onChange(view, shiftDate(view, date, -1))}
        >
          ‹
        </button>
        <span className={styles.label}>{periodLabel(view, date, t('weekdays'))}</span>
        <button
          type="button"
          className={styles.step}
          aria-label={t('cal.next')}
          onClick={() => onChange(view, shiftDate(view, date, 1))}
        >
          ›
        </button>
      </div>
    </div>
  );
}
