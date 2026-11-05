import type { TodoWithStatus } from '../../api/types';
import { useT } from '../../i18n';
import { todosOn } from './cellTodos';
import styles from './MobileCounts.module.css';

interface Props {
  cells: (string | null)[];
  todos: TodoWithStatus[];
  today: string;
  selected: string | null;
  onSelect(d: string): void;
}

export function MobileCounts({ cells, todos, today, selected, onSelect }: Props) {
  const t = useT();
  return (
    <div className={styles.grid}>
      {t('weekdays').map((w) => (
        <div key={w} className={styles.weekday}>
          {w}
        </div>
      ))}
      {cells.map((d, i) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: 채움 칸은 날짜가 없고 위치가 고정이라 인덱스가 안정적인 키다
        if (d === null) return <div key={`blank-${i}`} className={styles.blank} />;
        const count = todosOn(todos, d).length;
        return (
          <button
            key={d}
            type="button"
            className={styles.cell}
            data-selected={d === selected}
            data-today={d === today}
            data-dow={i % 7}
            aria-label={d}
            onClick={() => onSelect(d)}
          >
            <span className={styles.day}>{Number(d.slice(8))}</span>
            <span className={styles.count}>
              {count > 0 && (
                <>
                  <span className={styles.dot} aria-hidden="true" />
                  {count}
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
