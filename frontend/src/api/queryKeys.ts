import type { QueryClient } from '@tanstack/react-query';
import type { ApiError, TodoFilter } from './types';

export const queryKeys = {
  me: ['me'] as const,
  categories: ['categories'] as const,
  todos: (filter: TodoFilter, today: string) => ['todos', filter, today] as const,
  todo: (id: number) => ['todos', id] as const,
  calendar: (from: string, to: string, today: string) => ['calendar', from, to, today] as const,
};

// PR-L-11: 무효화는 이 헬퍼에서만 한다.
export async function invalidateTodos(qc: QueryClient): Promise<void> {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ['todos'] }),
    qc.invalidateQueries({ queryKey: ['calendar'] }),
  ]);
}

export async function invalidateCategories(qc: QueryClient): Promise<void> {
  await Promise.all([qc.invalidateQueries({ queryKey: ['categories'] }), invalidateTodos(qc)]);
}

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    queryMeta: { skipAuthRedirect?: boolean };
  }
}
