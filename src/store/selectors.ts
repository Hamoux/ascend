/**
 * Pure derived-analytics functions over the raw store collections.
 * Components read raw arrays from the store and memoize these.
 */
import type { Habit, LogEntry, Punishment, Redemption } from '@/types';
import {
  addDays,
  currentPeriodIndex,
  dayIndex,
  lastNDays,
  periodIndex,
  startOfWeek,
  toISODate,
  todayISO,
  weekdayShort,
} from '@/lib/date';

const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

/* --------------------------- Balance & totals --------------------------- */

export function balanceOf(logs: LogEntry[], redemptions: Redemption[]): number {
  return sum(logs.map((l) => l.points)) - sum(redemptions.map((r) => r.cost));
}

export function lifetimeEarned(logs: LogEntry[]): number {
  return sum(logs.filter((l) => l.type === 'complete').map((l) => l.points));
}

export function lifetimeLost(logs: LogEntry[]): number {
  return sum(logs.filter((l) => l.type === 'skip').map((l) => -l.points));
}

export function lifetimeSpent(redemptions: Redemption[]): number {
  return sum(redemptions.map((r) => r.cost));
}

/* --------------------------- Ranged aggregates --------------------------- */

function inRange(logs: LogEntry[], start: Date): LogEntry[] {
  const t = start.getTime();
  return logs.filter((l) => new Date(`${l.date}T00:00:00`).getTime() >= t);
}

export interface RangeStats {
  net: number;
  earned: number;
  lost: number;
  completes: number;
  skips: number;
  rate: number;
}

export function rangeStats(logs: LogEntry[], start: Date): RangeStats {
  const slice = inRange(logs, start);
  const completes = slice.filter((l) => l.type === 'complete');
  const skips = slice.filter((l) => l.type === 'skip');
  const earned = sum(completes.map((l) => l.points));
  const lost = sum(skips.map((l) => -l.points));
  const total = completes.length + skips.length;
  return {
    net: earned - lost,
    earned,
    lost,
    completes: completes.length,
    skips: skips.length,
    rate: total === 0 ? 0 : completes.length / total,
  };
}

export function completionRate(logs: LogEntry[]): number {
  const completes = logs.filter((l) => l.type === 'complete').length;
  const total = logs.length;
  return total === 0 ? 0 : completes / total;
}

/* --------------------------- Streaks --------------------------- */

function streaksFromIndices(indices: number[], current: number): { current: number; longest: number } {
  if (indices.length === 0) return { current: 0, longest: 0 };
  const sorted = Array.from(new Set(indices)).sort((a, b) => a - b);
  const have = new Set(sorted);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  let cur = 0;
  let cursor = have.has(current) ? current : current - 1;
  while (have.has(cursor)) {
    cur += 1;
    cursor -= 1;
  }

  return { current: cur, longest: Math.max(longest, cur) };
}

/** Consecutive days (ending today/yesterday) with at least one completion. */
export function activityStreak(logs: LogEntry[]): { current: number; longest: number } {
  const days = logs.filter((l) => l.type === 'complete').map((l) => dayIndex(l.date));
  return streaksFromIndices(days, dayIndex(todayISO()));
}

/* --------------------------- Per-habit stats --------------------------- */

export interface HabitStats {
  completes: number;
  skips: number;
  total: number;
  rate: number;
  current: number;
  longest: number;
  net: number;
  lastActivity?: number;
  /** True when the habit already has a log for its current period. */
  doneThisPeriod: boolean;
  periodLogType?: 'complete' | 'skip';
}

export function logsForHabit(habitId: string, logs: LogEntry[]): LogEntry[] {
  return logs.filter((l) => l.habitId === habitId);
}

export function currentPeriodLog(habit: Habit, logs: LogEntry[]): LogEntry | undefined {
  const cur = currentPeriodIndex(habit.frequency);
  return logsForHabit(habit.id, logs).find((l) => periodIndex(habit.frequency, l.date) === cur);
}

export function habitStats(habit: Habit, logs: LogEntry[]): HabitStats {
  const own = logsForHabit(habit.id, logs);
  const completes = own.filter((l) => l.type === 'complete');
  const skips = own.filter((l) => l.type === 'skip');
  const completeIdx = completes.map((l) => periodIndex(habit.frequency, l.date));
  const { current, longest } = streaksFromIndices(completeIdx, currentPeriodIndex(habit.frequency));
  const periodLog = currentPeriodLog(habit, logs);
  const lastActivity = own.length ? Math.max(...own.map((l) => l.createdAt)) : undefined;

  return {
    completes: completes.length,
    skips: skips.length,
    total: own.length,
    rate: own.length === 0 ? 0 : completes.length / own.length,
    current,
    longest,
    net: sum(own.map((l) => l.points)),
    lastActivity,
    doneThisPeriod: Boolean(periodLog),
    periodLogType: periodLog?.type,
  };
}

/* --------------------------- Leaderboards --------------------------- */

export interface HabitRollup {
  habitId: string;
  name: string;
  icon: string;
  completes: number;
  skips: number;
  net: number;
}

export function rollupByHabit(logs: LogEntry[]): HabitRollup[] {
  const map = new Map<string, HabitRollup>();
  for (const l of logs) {
    const existing =
      map.get(l.habitId) ??
      { habitId: l.habitId, name: l.habitName, icon: l.habitIcon, completes: 0, skips: 0, net: 0 };
    existing.name = l.habitName;
    existing.icon = l.habitIcon;
    if (l.type === 'complete') existing.completes += 1;
    else existing.skips += 1;
    existing.net += l.points;
    map.set(l.habitId, existing);
  }
  return [...map.values()];
}

export function mostCompleted(logs: LogEntry[]): HabitRollup | undefined {
  return rollupByHabit(logs)
    .filter((r) => r.completes > 0)
    .sort((a, b) => b.completes - a.completes)[0];
}

export function mostSkipped(logs: LogEntry[]): HabitRollup | undefined {
  return rollupByHabit(logs)
    .filter((r) => r.skips > 0)
    .sort((a, b) => b.skips - a.skips)[0];
}

/* --------------------------- Time series --------------------------- */

export interface DayPoint {
  iso: string;
  label: string;
  net: number;
  earned: number;
  lost: number;
  completes: number;
  skips: number;
}

export function dailySeries(logs: LogEntry[], days: number): DayPoint[] {
  const window = lastNDays(days);
  const byDay = new Map<string, DayPoint>();
  for (const iso of window) {
    byDay.set(iso, { iso, label: weekdayShort(iso), net: 0, earned: 0, lost: 0, completes: 0, skips: 0 });
  }
  for (const l of logs) {
    const cell = byDay.get(l.date);
    if (!cell) continue;
    cell.net += l.points;
    if (l.type === 'complete') {
      cell.earned += l.points;
      cell.completes += 1;
    } else {
      cell.lost += -l.points;
      cell.skips += 1;
    }
  }
  return window.map((iso) => byDay.get(iso)!);
}

/** Running balance across the window (seeded by the net before the window). */
export function cumulativeSeries(logs: LogEntry[], days: number): Array<{ iso: string; value: number }> {
  const window = lastNDays(days);
  const startIso = window[0];
  const baseline = sum(logs.filter((l) => l.date < startIso).map((l) => l.points));
  const series = dailySeries(logs, days);
  let running = baseline;
  return series.map((d) => {
    running += d.net;
    return { iso: d.iso, value: running };
  });
}

export interface WeekPoint {
  label: string;
  earned: number;
  lost: number;
  net: number;
}

export function weeklySeries(logs: LogEntry[], weeks: number): WeekPoint[] {
  const start = startOfWeek();
  const buckets: WeekPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(start);
    ws.setDate(ws.getDate() - i * 7);
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    const startIso = toISODate(ws);
    const endIso = toISODate(we);
    const slice = logs.filter((l) => l.date >= startIso && l.date < endIso);
    const earned = sum(slice.filter((l) => l.type === 'complete').map((l) => l.points));
    const lost = sum(slice.filter((l) => l.type === 'skip').map((l) => -l.points));
    buckets.push({ label: `${ws.getMonth() + 1}/${ws.getDate()}`, earned, lost, net: earned - lost });
  }
  return buckets;
}

/* --------------------------- Calendar --------------------------- */

export interface DayDetail {
  net: number;
  completes: LogEntry[];
  skips: LogEntry[];
}

/* --------------------------- Punishments --------------------------- */

export interface ActivePenalty {
  punishment: Punishment;
  /** Reason kind so the UI can localize the detail. */
  kind: 'balance' | 'skips';
  /** Threshold (balance) or skip count (skips), for interpolation. */
  n: number;
}

export function skipsInLast7(logs: LogEntry[]): number {
  const start = toISODate(addDays(new Date(), -6));
  return logs.filter((l) => l.type === 'skip' && l.date >= start).length;
}

export function activePenalties(
  punishments: Punishment[],
  logs: LogEntry[],
  redemptions: Redemption[],
): ActivePenalty[] {
  const balance = balanceOf(logs, redemptions);
  const skips7 = skipsInLast7(logs);
  const out: ActivePenalty[] = [];
  for (const p of punishments) {
    if (p.trigger === 'balance-below' && balance < p.threshold) {
      out.push({ punishment: p, kind: 'balance', n: p.threshold });
    }
    if (p.trigger === 'skip-streak' && skips7 >= p.threshold) {
      out.push({ punishment: p, kind: 'skips', n: skips7 });
    }
  }
  return out;
}

export function logsByDate(logs: LogEntry[]): Map<string, DayDetail> {
  const map = new Map<string, DayDetail>();
  for (const l of logs) {
    const entry = map.get(l.date) ?? { net: 0, completes: [], skips: [] };
    entry.net += l.points;
    if (l.type === 'complete') entry.completes.push(l);
    else entry.skips.push(l);
    map.set(l.date, entry);
  }
  return map;
}
