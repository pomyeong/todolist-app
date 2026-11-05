import { useLocation, useNavigate, useParams } from 'react-router';
import type { TodoInput } from '../api/types';
import { FormError } from '../components/FormError';
import { LoadingNotice } from '../components/LoadingNotice';
import { TodoForm } from '../features/todos/TodoForm';
import { useSaveTodo, useTodo } from '../features/todos/useTodos';

const EMPTY: TodoInput = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  startTime: null,
  endTime: null,
};

export function TodoFormPage() {
  const { id } = useParams();
  return id === undefined ? <FormBody /> : <EditLoader id={Number(id)} />;
}

function EditLoader({ id }: { id: number }) {
  const { data, error } = useTodo(id);
  if (error) {
    return (
      <>
        <h1>할일 편집</h1>
        <FormError message={error.message} />
      </>
    );
  }
  if (!data) return <LoadingNotice kind="initial" />;
  return (
    <FormBody
      id={id}
      initial={{
        title: data.title,
        description: data.description ?? '',
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        categoryId: data.categoryId,
      }}
    />
  );
}

function FormBody({ id, initial = EMPTY }: { id?: number; initial?: TodoInput }) {
  const navigate = useNavigate();
  const state: unknown = useLocation().state;
  const stateFrom = (state as { from?: unknown } | null)?.from;
  // P-17, PD-18: 진입 화면(state.from)으로 복귀, 없으면 /todos
  const back = typeof stateFrom === 'string' ? stateFrom : '/todos';
  const save = useSaveTodo(id);
  return (
    <>
      <h1>{id === undefined ? '할일 등록' : '할일 편집'}</h1>
      <TodoForm
        initial={initial}
        error={save.error}
        pending={save.isPending}
        onSubmit={(input) => save.mutate(input, { onSuccess: () => navigate(back) })}
        onCancel={() => navigate(back)}
      />
    </>
  );
}
