import { request } from './client';
import type { Todo, TodoFilter, TodoInput, TodoWithStatus } from './types';

export function listTodos(filter: TodoFilter, today: string) {
  const q = new URLSearchParams();
  if (filter.categoryId !== undefined) q.set('categoryId', String(filter.categoryId));
  if (filter.status !== undefined) q.set('status', filter.status);
  q.set('today', today);
  return request<TodoWithStatus[]>('GET', `/api/todos?${q}`);
}
export const getTodo = (id: number) => request<Todo>('GET', `/api/todos/${id}`);
export const createTodo = (i: TodoInput) => request<Todo>('POST', '/api/todos', i);
export const updateTodo = (id: number, i: TodoInput) =>
  request<Todo>('PATCH', `/api/todos/${id}`, i);
export const deleteTodo = (id: number) => request<void>('DELETE', `/api/todos/${id}`);
export const setTodoCompleted = (id: number, completed: boolean) =>
  request<Todo>('PATCH', `/api/todos/${id}/completed`, { completed });
