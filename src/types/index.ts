/** Ascend — domain model types. */

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type HabitKind = 'recurring' | 'one-time';
export type LogType = 'complete' | 'skip';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon: string;
  frequency: Frequency;
  kind: HabitKind;
  positivePoints: number;
  negativePoints: number;
  notes?: string;
  createdAt: number;
  /** Set when a one-time task is resolved (completed or skipped) and retired from the active board. */
  archivedAt?: number;
}

export interface LogEntry {
  id: string;
  habitId: string;
  /** Denormalized snapshot so history & activity survive habit edits/deletes. */
  habitName: string;
  habitIcon: string;
  type: LogType;
  /** Signed: positive for a completion, negative for a skip. */
  points: number;
  /** 'YYYY-MM-DD' (local) — the day this entry applies to. */
  date: string;
  /** ms epoch when the entry was recorded. */
  createdAt: number;
  note?: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  category: string;
  cost: number;
  icon: string;
  /** Optional image (data URL or remote URL). */
  image?: string;
  createdAt: number;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardIcon: string;
  cost: number;
  createdAt: number;
}

export type PunishmentTrigger = 'balance-below' | 'skip-streak';

export interface Punishment {
  id: string;
  name: string;
  description?: string;
  trigger: PunishmentTrigger;
  /** Balance level (for balance-below) or consecutive-skip count (for skip-streak). */
  threshold: number;
  icon: string;
  createdAt: number;
}

export type AppView = 'dashboard' | 'habits' | 'rewards' | 'analytics' | 'calendar' | 'settings';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'points';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  /** Optional signed point delta rendered as a pill. */
  points?: number;
}

export interface Profile {
  name: string;
}

export interface PersistedState {
  profile: Profile;
  habits: Habit[];
  logs: LogEntry[];
  rewards: Reward[];
  redemptions: Redemption[];
  punishments: Punishment[];
  seeded: boolean;
}
