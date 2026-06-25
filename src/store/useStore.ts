/** Central application store: state, mutations, persistence. */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppView,
  Habit,
  LogEntry,
  Profile,
  Punishment,
  Redemption,
  Reward,
  Toast,
} from '@/types';
import { uid } from '@/lib/id';
import { todayISO } from '@/lib/date';
import { balanceOf, currentPeriodLog, skipsInLast7 } from '@/store/selectors';
import { createSeed } from '@/store/seed';
import { translate, type Language, type TKey, type TParams } from '@/i18n';

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'archivedAt'>;
export type RewardDraft = Omit<Reward, 'id' | 'createdAt'>;
export type PunishmentDraft = Omit<Punishment, 'id' | 'createdAt'>;

interface Store {
  /* persisted */
  profile: Profile;
  habits: Habit[];
  logs: LogEntry[];
  rewards: Reward[];
  redemptions: Redemption[];
  punishments: Punishment[];
  seeded: boolean;
  language: Language;

  /* ephemeral UI */
  view: AppView;
  toasts: Toast[];

  /* lifecycle */
  initialize: () => void;
  reseed: () => void;
  resetAll: () => void;
  setProfileName: (name: string) => void;
  setLanguage: (language: Language) => void;
  setView: (view: AppView) => void;

  /* habits */
  addHabit: (draft: HabitDraft) => void;
  updateHabit: (id: string, patch: Partial<HabitDraft>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => void;
  skipHabit: (id: string) => void;
  restoreHabit: (id: string) => void;

  /* logs */
  deleteLog: (id: string) => void;

  /* rewards */
  addReward: (draft: RewardDraft) => void;
  updateReward: (id: string, patch: Partial<RewardDraft>) => void;
  deleteReward: (id: string) => void;
  redeemReward: (id: string) => boolean;

  /* punishments */
  addPunishment: (draft: PunishmentDraft) => void;
  updatePunishment: (id: string, patch: Partial<PunishmentDraft>) => void;
  deletePunishment: (id: string) => void;

  /* toasts */
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_PROFILE: Profile = { name: 'Achiever' };

function makeLog(habit: Habit, type: 'complete' | 'skip'): LogEntry {
  const points = type === 'complete' ? habit.positivePoints : -Math.abs(habit.negativePoints);
  return {
    id: uid('log'),
    habitId: habit.id,
    habitName: habit.name,
    habitIcon: habit.icon,
    type,
    points,
    date: todayISO(),
    createdAt: Date.now(),
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Translate against the current language (toasts read this at push time). */
      const tr = (key: TKey, params?: TParams) => translate(get().language, key, params);

      /** Surface any penalty that just crossed its trigger threshold. */
      const notifyPunishments = (prevBalance: number, prevSkips: number) => {
        const { logs, redemptions, punishments, pushToast } = get();
        const balance = balanceOf(logs, redemptions);
        const skips = skipsInLast7(logs);
        for (const p of punishments) {
          if (p.trigger === 'balance-below' && prevBalance >= p.threshold && balance < p.threshold) {
            pushToast({ variant: 'warning', title: tr('toast.penalty_due', { name: p.name }), message: tr('toast.penalty_balance', { n: p.threshold }) });
          }
          if (p.trigger === 'skip-streak' && prevSkips < p.threshold && skips >= p.threshold) {
            pushToast({ variant: 'warning', title: tr('toast.penalty_due', { name: p.name }), message: tr('toast.penalty_skips', { n: skips }) });
          }
        }
      };

      return {
        profile: DEFAULT_PROFILE,
        habits: [],
        logs: [],
        rewards: [],
        redemptions: [],
        punishments: [],
        seeded: false,
        language: 'en',

        view: 'dashboard',
        toasts: [],

        initialize: () => {
          if (get().seeded) return;
          set({ ...createSeed(), seeded: true });
        },

        reseed: () => {
          set({ ...createSeed(), seeded: true });
          get().pushToast({ variant: 'success', title: tr('toast.demo_loaded'), message: tr('toast.demo_loaded_msg') });
        },

        resetAll: () => {
          set({
            profile: DEFAULT_PROFILE,
            habits: [],
            logs: [],
            rewards: [],
            redemptions: [],
            punishments: [],
            seeded: true,
          });
          get().pushToast({ variant: 'info', title: tr('toast.cleared'), message: tr('toast.cleared_msg') });
        },

        setProfileName: (name) => set({ profile: { name: name.trim() || DEFAULT_PROFILE.name } }),
        setLanguage: (language) => {
          if (typeof document !== 'undefined') document.documentElement.lang = language;
          set({ language });
        },
        setView: (view) => set({ view }),

        addHabit: (draft) => {
          const habit: Habit = { ...draft, id: uid('habit'), createdAt: Date.now() };
          set({ habits: [habit, ...get().habits] });
          get().pushToast({ variant: 'success', title: tr('toast.habit_created'), message: habit.name });
        },

        updateHabit: (id, patch) =>
          set({ habits: get().habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) }),

        deleteHabit: (id) => {
          set({ habits: get().habits.filter((h) => h.id !== id) });
          get().pushToast({ variant: 'info', title: tr('toast.habit_deleted'), message: tr('toast.habit_deleted_msg') });
        },

        completeHabit: (id) => {
          const { habits, logs, redemptions } = get();
          const habit = habits.find((h) => h.id === id);
          if (!habit) return;
          const prevBalance = balanceOf(logs, redemptions);
          const prevSkips = skipsInLast7(logs);

          if (habit.kind === 'one-time') {
            if (habit.archivedAt) return;
            const log = makeLog(habit, 'complete');
            set({
              logs: [...logs, log],
              habits: habits.map((h) => (h.id === id ? { ...h, archivedAt: Date.now() } : h)),
            });
            get().pushToast({ variant: 'points', title: tr('toast.onetime_done', { name: habit.name }), points: log.points });
            notifyPunishments(prevBalance, prevSkips);
            return;
          }

          const existing = currentPeriodLog(habit, logs);
          if (existing?.type === 'complete') {
            get().pushToast({
              variant: 'info',
              title: tr('toast.already_done'),
              message: tr('toast.already_done_msg', { period: tr(`freq.adj.${habit.frequency}` as TKey) }),
            });
            return;
          }
          const rest = existing ? logs.filter((l) => l.id !== existing.id) : logs;
          const log = makeLog(habit, 'complete');
          set({ logs: [...rest, log] });
          get().pushToast({ variant: 'points', title: habit.name, message: tr('toast.marked_complete'), points: log.points });
          notifyPunishments(prevBalance, prevSkips);
        },

        skipHabit: (id) => {
          const { habits, logs, redemptions } = get();
          const habit = habits.find((h) => h.id === id);
          if (!habit) return;
          const prevBalance = balanceOf(logs, redemptions);
          const prevSkips = skipsInLast7(logs);

          if (habit.kind === 'one-time') {
            if (habit.archivedAt) return;
            const log = makeLog(habit, 'skip');
            set({
              logs: [...logs, log],
              habits: habits.map((h) => (h.id === id ? { ...h, archivedAt: Date.now() } : h)),
            });
            get().pushToast({ variant: 'points', title: tr('toast.onetime_skip', { name: habit.name }), points: log.points });
            notifyPunishments(prevBalance, prevSkips);
            return;
          }

          const existing = currentPeriodLog(habit, logs);
          if (existing?.type === 'skip') {
            get().pushToast({ variant: 'info', title: tr('toast.already_skip'), message: tr('toast.already_skip_msg') });
            return;
          }
          const rest = existing ? logs.filter((l) => l.id !== existing.id) : logs;
          const log = makeLog(habit, 'skip');
          set({ logs: [...rest, log] });
          get().pushToast({ variant: 'points', title: habit.name, message: tr('toast.marked_skipped'), points: log.points });
          notifyPunishments(prevBalance, prevSkips);
        },

        restoreHabit: (id) =>
          set({ habits: get().habits.map((h) => (h.id === id ? { ...h, archivedAt: undefined } : h)) }),

        deleteLog: (id) => set({ logs: get().logs.filter((l) => l.id !== id) }),

        addReward: (draft) => {
          const reward: Reward = { ...draft, id: uid('rwd'), createdAt: Date.now() };
          set({ rewards: [reward, ...get().rewards] });
          get().pushToast({ variant: 'success', title: tr('toast.reward_added'), message: reward.name });
        },

        updateReward: (id, patch) =>
          set({ rewards: get().rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)) }),

        deleteReward: (id) => {
          set({ rewards: get().rewards.filter((r) => r.id !== id) });
          get().pushToast({ variant: 'info', title: tr('toast.reward_removed') });
        },

        redeemReward: (id) => {
          const { rewards, logs, redemptions } = get();
          const reward = rewards.find((r) => r.id === id);
          if (!reward) return false;
          const balance = balanceOf(logs, redemptions);
          if (balance < reward.cost) {
            get().pushToast({
              variant: 'error',
              title: tr('toast.not_enough'),
              message: tr('toast.not_enough_msg', { n: reward.cost - balance, name: reward.name }),
            });
            return false;
          }
          const redemption: Redemption = {
            id: uid('rdm'),
            rewardId: reward.id,
            rewardName: reward.name,
            rewardIcon: reward.icon,
            cost: reward.cost,
            createdAt: Date.now(),
          };
          set({ redemptions: [redemption, ...redemptions] });
          get().pushToast({
            variant: 'success',
            title: tr('toast.unlocked', { name: reward.name }),
            message: tr('toast.unlocked_msg'),
            points: -reward.cost,
          });
          return true;
        },

        addPunishment: (draft) => {
          const punishment: Punishment = { ...draft, id: uid('pun'), createdAt: Date.now() };
          set({ punishments: [punishment, ...get().punishments] });
          get().pushToast({ variant: 'success', title: tr('toast.penalty_added'), message: punishment.name });
        },

        updatePunishment: (id, patch) =>
          set({ punishments: get().punishments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),

        deletePunishment: (id) =>
          set({ punishments: get().punishments.filter((p) => p.id !== id) }),

        pushToast: (toast) => {
          const id = uid('toast');
          set({ toasts: [...get().toasts, { ...toast, id }] });
        },

        dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
      };
    },
    {
      name: 'ascend.store.v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (s) => ({
        profile: s.profile,
        habits: s.habits,
        logs: s.logs,
        rewards: s.rewards,
        redemptions: s.redemptions,
        punishments: s.punishments,
        seeded: s.seeded,
        language: s.language,
      }),
    },
  ),
);
