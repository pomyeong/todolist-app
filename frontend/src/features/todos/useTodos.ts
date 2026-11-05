import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listCategories } from '../../api/categories';
import { invalidateTodos, queryKeys } from '../../api/queryKeys';
import {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  setTodoCompleted,
  updateTodo,
} from '../../api/todos';
import type { TodoInput } from '../../api/types';
import { useToday } from '../../lib/useToday';
import { useFilterStore } from './filterStore';

export function useTodoList() {
  const filter = useFilterStore((s) => s.filter);
  const today = useToday();
  return useQuery({
    queryKey: queryKeys.todos(filter, today),
    queryFn: () => listTodos(filter, today),
  });
}

export function useCategoryOptions() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: listCategories });
}

export function useToggleTodo(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (completed: boolean) => setTodoCompleted(id, completed),
    onSuccess: () => invalidateTodos(qc),
  });
}

export function useDeleteTodo(id: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => deleteTodo(id), onSuccess: () => invalidateTodos(qc) });
}

// 편집 폼이 오래된 캐시로 채워지지 않도록 gcTime 0
export function useTodo(id: number) {
  return useQuery({ queryKey: queryKeys.todo(id), queryFn: () => getTodo(id), gcTime: 0 });
}

export function useSaveTodo(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TodoInput) =>
      id === undefined ? createTodo(input) : updateTodo(id, input),
    onSuccess: () => invalidateTodos(qc),
  });
}
