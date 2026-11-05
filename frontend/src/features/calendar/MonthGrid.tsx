import type { TodoWithStatus } from '../../api/types';
import { useT } from '../../i18n';
import styles from './MonthGrid.module.css';
import { WeekRow } from './WeekRow';

interface Props {
  cells: (string | null)[]; // 월 뷰(빈칸 null) 또는 4주 뷰 28칸
  showMonth?: boolean; // P-30: 첫 칸·매달 1일은 'M/D'
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

export function MonthGrid({ cells, showMonth = false, todos, today, selected, onSelect }: Props) {
  const t = useT();
  const label = (d: string) =>
    showMonth && (d === cells[0] || d.endsWith('-01'))
      ? `${Number(d.slice(5, 7))}/${Number(d.slice(8))}`
      : String(Number(d.slice(8)));
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  return (
    <div className={styles.grid}>
      <div className={styles.weekdays}>
        {t('weekdays').map((w) => (
          <div key={w} className={styles.weekday}>
            {w}
          </div>
        ))}
      </div>
      {weeks.map((days, w) => (
        <WeekRow
          key={days.find((d) => d !== null)}
          days={days}
          alt={w % 2 === 1}
          label={label}
          todos={todos}
          today={today}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
