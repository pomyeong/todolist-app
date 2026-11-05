import { create } from 'zustand';

interface CalendarState {
  selected: string | null;
  select(d: string | null): void;
  reset(): void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selected: null,
  select: (selected) => set({ selected }),
  reset: () => set({ selected: null }),
}));
