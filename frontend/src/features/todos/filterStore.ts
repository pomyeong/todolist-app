import { create } from 'zustand';
import type { TodoFilter } from '../../api/types';

interface FilterState {
  filter: TodoFilter;
  setFilter(patch: Partial<TodoFilter>): void;
  reset(): void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filter: {},
  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  reset: () => set({ filter: {} }),
}));
