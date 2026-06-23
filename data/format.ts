/**
 * Date + label helpers, ported from the prototype's logic class.
 *
 * Two deliberate changes from the prototype:
 *  1. The clock is injected (`now`) instead of the hardcoded 2026-06-20 demo
 *     date — production uses the real current date.
 *  2. Past days are no longer treated as disabled. `buildCalendar` still flags
 *     `isPast` for optional styling, but selection is allowed so members can
 *     backfill meetings/books the club has already read.
 */

export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const MO = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;
export const MOL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const MS_PER_DAY = 86_400_000;

/** Build an ISO yyyy-mm-dd string (month is 0-based, matching Date). */
export function isoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Parse an ISO yyyy-mm-dd into a local Date at midnight. */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Midnight (local) of the given date, as a Date. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** ISO of today relative to `now`. */
export function todayIso(now: Date): string {
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole days between two ISO dates (b - a), ignoring time-of-day. */
export function daysBetweenIso(aIso: string, bIso: string): number {
  return Math.round((parseIso(bIso).getTime() - parseIso(aIso).getTime()) / MS_PER_DAY);
}

/** ISO of `iso` shifted by `delta` days. */
export function addDaysIso(iso: string, delta: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + delta);
  return isoOf(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface FormattedDate {
  iso: string;
  weekday: string; // "Thu"
  day: string; // "23"
  month: string; // "Jul"
  /** "Thu Jul 23" */
  label: string;
  /** Whole days from `now` to this date (negative if in the past). */
  days: number;
}

/** Format an ISO date into the chips/labels the UI uses, relative to `now`. */
export function fmtDate(iso: string, now: Date): FormattedDate {
  const dt = parseIso(iso);
  return {
    iso,
    weekday: WD[dt.getDay()],
    day: String(dt.getDate()),
    month: MO[dt.getMonth()],
    label: `${WD[dt.getDay()]} ${MO[dt.getMonth()]} ${dt.getDate()}`,
    days: daysBetweenIso(todayIso(now), iso),
  };
}

/** Relative label for a day-delta: "today" / "tomorrow" / "in N days" /
 *  "yesterday" / "N days ago". */
export function relLabel(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

/** The calendar month+year that contains the given ISO date. */
export function calTo(iso: string): { calYear: number; calMonth: number } {
  const [y, m] = iso.split('-').map(Number);
  return { calYear: y, calMonth: m - 1 };
}

export interface CalendarCell {
  empty: boolean;
  day: string;
  iso: string;
  isPast: boolean;
  selected: boolean;
  isToday: boolean;
}

/**
 * A month grid (leading blanks + day cells) for `year`/`month` (0-based),
 * marking the selected day, today, and past days. Past days are flagged but
 * remain selectable — the screen decides interactivity.
 */
export function buildCalendar(
  year: number,
  month: number,
  selectedIso: string,
  now: Date,
): CalendarCell[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tIso = todayIso(now);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startDow; i++) {
    cells.push({ empty: true, day: '', iso: '', isPast: false, selected: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoOf(year, month, d);
    cells.push({
      empty: false,
      day: String(d),
      iso,
      isPast: daysBetweenIso(tIso, iso) < 0,
      selected: iso === selectedIso,
      isToday: iso === tIso,
    });
  }
  return cells;
}

/** Friendly chat timestamp: "Just now", "9:14am" today, "Mon 9:14" this week,
 *  else "Jun 12". */
export function formatChatTime(createdAt: number, now: Date): string {
  const diffMin = Math.round((now.getTime() - createdAt) / 60_000);
  if (diffMin < 1) return 'Just now';

  const d = new Date(createdAt);
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const sameDay = startOfDay(d).getTime() === startOfDay(now).getTime();
  if (sameDay) {
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${min}${h < 12 ? 'am' : 'pm'}`;
  }
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / MS_PER_DAY);
  if (diffDays < 7) return `${WD[d.getDay()]} ${h}:${min}`;
  return `${MO[d.getMonth()]} ${d.getDate()}`;
}
