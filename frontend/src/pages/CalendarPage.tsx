import { useSearchParams } from 'react-router';
import { FormError } from '../components/FormError';
import { LoadingNotice } from '../components/LoadingNotice';
import { CalendarToolbar } from '../features/calendar/CalendarToolbar';
import { useCalendarStore } from '../features/calendar/calendarStore';
import { DayList } from '../features/calendar/DayList';
import { MobileCounts } from '../features/calendar/MobileCounts';
import { MonthGrid } from '../features/calendar/MonthGrid';
import type { CalendarView } from '../features/calendar/range';
import { monthCells, pickSelected, rangeOf, weekDays } from '../features/calendar/range';
import { useCalendar } from '../features/calendar/useCalendar';
import { WeekGrid } from '../features/calendar/WeekGrid';
import { useToday } from '../lib/useToday';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function CalendarPage() {
  const today = useToday();
  const [params, setParams] = useSearchParams();
  const rawView = params.get('view');
  const view: CalendarView = rawView === 'week' || rawView === 'day' ? rawView : 'month';
  const rawDate = params.get('date');
  const date = rawDate !== null && DATE_RE.test(rawDate) ? rawDate : today;

  const range = rangeOf(view, date);
  const { data, error } = useCalendar(range, today);
  const storedSelected = useCalendarStore((s) => s.selected);
  const select = useCalendarStore((s) => s.select);
  const selected = pickSelected(storedSelected, today, range);
  const todos = data ?? [];

  return (
    <>
      <FormError message={error?.message} />
      <CalendarToolbar
        view={view}
        date={date}
        onChange={(v, d) => setParams({ view: v, date: d })}
      />
      {data === undefined && error === null ? (
        <LoadingNotice kind="initial" />
      ) : view === 'day' ? (
        <DayList date={date} todos={todos} />
      ) : (
        <>
          {view === 'week' ? (
            <WeekGrid
              date={date}
              todos={todos}
              today={today}
              selected={selected}
              onSelect={select}
            />
          ) : (
            <MonthGrid
              date={date}
              todos={todos}
              today={today}
              selected={selected}
              onSelect={select}
            />
          )}
          <MobileCounts
            cells={view === 'week' ? weekDays(date) : monthCells(date)}
            todos={todos}
            today={today}
            selected={selected}
            onSelect={select}
          />
          {selected !== null && <DayList date={selected} todos={todos} />}
        </>
      )}
    </>
  );
}
