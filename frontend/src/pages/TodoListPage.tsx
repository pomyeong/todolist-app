import { useState } from 'react';
import { Link } from 'react-router';
import type { ApiError } from '../api/types';
import { EmptyNotice } from '../components/EmptyNotice';
import { FormError } from '../components/FormError';
import { LoadingNotice } from '../components/LoadingNotice';
import { TodoFilters } from '../features/todos/TodoFilters';
import { TodoRow } from '../features/todos/TodoRow';
import { useTodoList } from '../features/todos/useTodos';

export function TodoListPage() {
  const { data, isPending, error } = useTodoList();
  const [actionError, setActionError] = useState<ApiError | null>(null);
  return (
    <>
      <h1>할일 목록</h1>
      <FormError message={(actionError ?? error)?.message} />
      <p>
        <Link to="/todos/new" state={{ from: '/todos' }} className="primary">
          + 할일 등록
        </Link>
      </p>
      <TodoFilters />
      {isPending && !error ? (
        <LoadingNotice kind="initial" />
      ) : data?.length === 0 ? (
        <EmptyNotice />
      ) : (
        <ul style={{ padding: 0 }}>
          {data?.map((t) => (
            <TodoRow key={t.id} todo={t} onError={setActionError} />
          ))}
        </ul>
      )}
    </>
  );
}
