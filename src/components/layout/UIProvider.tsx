import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Habit, Punishment, Reward } from '@/types';
import { HabitForm } from '@/features/habits/HabitForm';
import { RewardForm } from '@/features/rewards/RewardForm';
import { PunishmentForm } from '@/features/punishments/PunishmentForm';

interface UIContextValue {
  openHabitForm: (habit?: Habit | null) => void;
  openRewardForm: (reward?: Reward | null) => void;
  openPunishmentForm: (punishment?: Punishment | null) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

interface FormState<T> {
  open: boolean;
  editing: T | null;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [habit, setHabit] = useState<FormState<Habit>>({ open: false, editing: null });
  const [reward, setReward] = useState<FormState<Reward>>({ open: false, editing: null });
  const [punishment, setPunishment] = useState<FormState<Punishment>>({ open: false, editing: null });

  const value = useMemo<UIContextValue>(
    () => ({
      openHabitForm: (h = null) => setHabit({ open: true, editing: h }),
      openRewardForm: (r = null) => setReward({ open: true, editing: r }),
      openPunishmentForm: (p = null) => setPunishment({ open: true, editing: p }),
    }),
    [],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <HabitForm open={habit.open} editing={habit.editing} onClose={() => setHabit((s) => ({ ...s, open: false }))} />
      <RewardForm open={reward.open} editing={reward.editing} onClose={() => setReward((s) => ({ ...s, open: false }))} />
      <PunishmentForm
        open={punishment.open}
        editing={punishment.editing}
        onClose={() => setPunishment((s) => ({ ...s, open: false }))}
      />
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
