import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../features/auth/authStore';
import { useCalendarStore } from '../features/calendar/calendarStore';
import { useFilterStore } from '../features/todos/filterStore';
import { log } from '../lib/log';

export function clearSession(qc: QueryClient): void {
  log('auth', '세션 정리(스토어·쿼리 캐시 초기화)');
  useAuthStore.getState().reset();
  useFilterStore.getState().reset();
  useCalendarStore.getState().reset();
  qc.clear();
}
