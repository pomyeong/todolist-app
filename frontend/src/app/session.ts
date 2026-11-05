import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../features/auth/authStore';
import { useCalendarStore } from '../features/calendar/calendarStore';
import { useFilterStore } from '../features/todos/filterStore';

export function clearSession(qc: QueryClient): void {
  useAuthStore.getState().reset();
  useFilterStore.getState().reset();
  useCalendarStore.getState().reset();
  qc.clear();
}
