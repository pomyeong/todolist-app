import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { ApiError, TodoWithStatus } from '../../api/types';
import { STATUS_LABEL } from '../../api/types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import styles from './TodoRow.module.css';
import { useDeleteTodo, useToggleTodo } from './useTodos';

interface Props {
  todo: TodoWithStatus;
  onError(e: ApiError | null): void;
}

// WF-04 데스크톱 표 머리줄. 각 행의 조작 요소에 이미 접근 가능한 이름이 있어 보조기기에는 숨긴다.
export function TodoListHeader() {
  return (
    <div className={styles.head} aria-hidden="true">
      <span>완료</span>
      <span>제목</span>
      <span>기간</span>
      <span>카테고리</span>
      <span>상태</span>
      <span />
    </div>
  );
}

export function TodoRow({ todo, onError }: Props) {
  const { pathname, search } = useLocation();
  const [confirming, setConfirming] = useState(false);
  const toggle = useToggleTodo(todo.id);
  const remove = useDeleteTodo(todo.id);
  const busy = toggle.isPending || remove.isPending;

  return (
    <li className={styles.row} data-status={todo.status}>
      <input
        className={styles.check}
        type="checkbox"
        aria-label={`${todo.title} 완료`}
        checked={todo.completed}
        disabled={busy}
        onChange={(e) => {
          onError(null);
          // P-15: 낙관적 업데이트 없이 저장 성공 후 재조회 결과로 표시
          toggle.mutate(e.target.checked, { onError });
        }}
      />
      <Link
        className={styles.title}
        to={`/todos/${todo.id}/edit`}
        state={{ from: pathname + search }}
      >
        {todo.title}
      </Link>
      <span className={styles.period}>
        {todo.startDate} ~ {todo.endDate}
      </span>
      <span className={styles.meta}>
        <span className={styles.category}>{todo.categoryName}</span>
        <span className={styles.dot} aria-hidden="true">
          ·
        </span>
        <span className="chip" data-status={todo.status}>
          {STATUS_LABEL[todo.status]}
        </span>
      </span>
      <button
        type="button"
        className={styles.del}
        disabled={busy}
        onClick={() => {
          onError(null);
          setConfirming(true);
        }}
      >
        삭제
      </button>
      {confirming && (
        <ConfirmDialog
          title="이 할일을 삭제할까요?"
          pending={remove.isPending}
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            remove.mutate(undefined, {
              onError: (e) => {
                setConfirming(false);
                onError(e);
              },
            })
          }
        />
      )}
    </li>
  );
}
