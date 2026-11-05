import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { invalidateCategories, invalidateTodos, queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('키 모양', () => {
    expect(queryKeys.todos({ categoryId: 2 }, '2026-11-04')).toEqual([
      'todos',
      { categoryId: 2 },
      '2026-11-04',
    ]);
    expect(queryKeys.calendar('2026-11-01', '2026-11-30', '2026-11-04')).toEqual([
      'calendar',
      '2026-11-01',
      '2026-11-30',
      '2026-11-04',
    ]);
    expect(queryKeys.me).toEqual(['me']);
    expect(queryKeys.categories).toEqual(['categories']);
    expect(queryKeys.todo(3)).toEqual(['todos', 3]);
  });
});

describe('무효화 헬퍼', () => {
  const keysOf = (spy: { mock: { calls: unknown[][] } }): unknown[] =>
    spy.mock.calls.map((args) => (args[0] as { queryKey?: unknown } | undefined)?.queryKey);

  it('invalidateTodos → todos, calendar만', async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    await invalidateTodos(qc);
    const keys = keysOf(spy);
    expect(keys).toHaveLength(2);
    expect(keys).toEqual(expect.arrayContaining([['todos'], ['calendar']]));
  });

  it('invalidateCategories → categories, todos, calendar (me 제외)', async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    await invalidateCategories(qc);
    const keys = keysOf(spy);
    expect(keys).toHaveLength(3);
    expect(keys).toEqual(expect.arrayContaining([['categories'], ['todos'], ['calendar']]));
    expect(keys).not.toContainEqual(['me']);
  });
});
