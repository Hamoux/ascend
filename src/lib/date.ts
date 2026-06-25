/** Date helpers. All "ISO" values are local-day strings: 'YYYY-MM-DD'. */
import type { Frequency } from '@/types';

const DAY_MS = 86_400_000;

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Stable, timezone-independent day number for an ISO date. */
export function dayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

/**
 * Monotonic index for the period that `iso` falls in, for the given frequency.
 * Consecutive periods differ by exactly 1 — used for streak math.
 */
export function periodIndex(freq: Frequency, iso: string): number {
  const [y, m] = iso.split('-').map(Number);
  switch (freq) {
    case 'daily':
      return dayIndex(iso);
    case 'weekly':
      // +3 aligns the epoch (a Thursday) to Monday-started weeks.
      return Math.floor((dayIndex(iso) + 3) / 7);
    case 'monthly':
      return y * 12 + (m - 1);
    case 'yearly':
      return y;
  }
}

export function currentPeriodIndex(freq: Frequency): number {
  return periodIndex(freq, todayISO());
}

/** Inclusive list of ISO dates for the last `n` days, oldest first. */
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(toISODate(addDays(end, -i)));
  return out;
}

export function startOfWeek(d: Date = new Date()): Date {
  const r = new Date(d);
  const offset = (r.getDay() + 6) % 7; // Monday = 0
  r.setDate(r.getDate() - offset);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function startOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), 0, 1);
}

/** True when an ISO date is within the calendar range [start, now]. */
export function isOnOrAfter(iso: string, start: Date): boolean {
  return parseISO(iso).getTime() >= start.getTime();
}

/* ------------------------- Formatting ------------------------- */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function weekdayShort(iso: string): string {
  return WEEKDAYS[parseISO(iso).getDay()];
}

export function monthName(month: number): string {
  return MONTHS[month];
}

export function formatDate(iso: string, opts: { year?: boolean } = {}): string {
  const d = parseISO(iso);
  const base = `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  return opts.year ? `${base}, ${d.getFullYear()}` : base;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatRelative(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(toISODate(new Date(ts)));
}

export function relativeDayLabel(iso: string): string {
  const t = todayISO();
  if (iso === t) return 'Today';
  if (iso === toISODate(addDays(new Date(), -1))) return 'Yesterday';
  return formatDate(iso);
}

export function frequencyAdjective(freq: Frequency): string {
  return { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[freq];
}

/* ------------------------- Calendar grid ------------------------- */

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

/** Monday-started 6-row month matrix with leading/trailing days for a clean grid. */
export function monthMatrix(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = addDays(first, -lead);
  const today = todayISO();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const iso = toISODate(d);
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === today,
    });
  }
  return cells;
}
