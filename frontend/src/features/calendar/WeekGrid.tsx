import type { TodoWithStatus } from '../../api/types';
import { useT } from '../../i18n';
import { weekDays } from './range';
import styles from './WeekGrid.module.css';
import { WeekRow } from './WeekRow';

interface Props {
  date: string;
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

export function WeekGrid({ date, todos, today, selected, onSelect }: Props) {
  const t = useT();
  return (
    <div className={styles.grid}>
      <WeekRow
        days={weekDays(date)}
        label={(d, i) => `${t('weekdays')[i]} ${d.slice(5)}`}
        todos={todos}
        today={today}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  );
}
