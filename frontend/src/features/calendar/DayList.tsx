import { Link, useLocation } from 'react-router';
import type { TodoWithStatus } from '../../api/types';
import { EmptyNotice } from '../../components/EmptyNotice';
import { TodoTitle } from '../../components/TodoTitle';
import { useT } from '../../i18n';
import { todosOn } from './cellTodos';
import styles from './DayList.module.css';

export function DayList({ date, todos }: { date: string; todos: TodoWithStatus[] }) {
  const tr = useT(); // 목록 변수 t와 겹치지 않게
  const { pathname, search } = useLocation();
  const items = todosOn(todos, date);
  return (
    <section className={styles.list} aria-label={tr('cal.dayTodos')(date)}>
      <h2 className={styles.heading}>{date}</h2>
      {items.length === 0 ? (
        <EmptyNotice />
      ) : (
        <ul className={styles.items}>
          {items.map((t) => (
            <li key={t.id} className={styles.item}>
              <Link
                to={`/todos/${t.id}/edit`}
                state={{ from: pathname + search }}
                className={styles.title}
              >
                <TodoTitle title={t.title} description={t.description} startTime={t.startTime} />
              </Link>
              <span className={styles.period}>
                {t.startDate} ~ {t.endDate}
              </span>
              <span className="chip" data-status={t.status}>
                {tr(`status.${t.status}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
