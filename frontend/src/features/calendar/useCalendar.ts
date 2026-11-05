import { useQuery } from '@tanstack/react-query';
import { getCalendar } from '../../api/calendar';
import { queryKeys } from '../../api/queryKeys';
import type { DateRange } from './range';

export function useCalendar(range: DateRange, today: string) {
  return useQuery({
    queryKey: queryKeys.calendar(range.from, range.to, today),
    queryFn: () => getCalendar(range.from, range.to, today),
  });
}
