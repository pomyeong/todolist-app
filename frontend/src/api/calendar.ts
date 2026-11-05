import { request } from './client';
import type { TodoWithStatus } from './types';

export function getCalendar(from: string, to: string, today: string) {
  const q = new URLSearchParams({ from, to, today });
  return request<TodoWithStatus[]>('GET', `/api/calendar?${q}`);
}
