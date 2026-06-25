/** Convenience hooks for frequently-read derived values. */
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { balanceOf, lifetimeEarned } from '@/store/selectors';
import { levelFromXp, type LevelInfo } from '@/lib/levels';

export function useBalance(): number {
  return useStore((s) => balanceOf(s.logs, s.redemptions));
}

export function useLevel(): LevelInfo {
  const xp = useStore((s) => lifetimeEarned(s.logs));
  return useMemo(() => levelFromXp(xp), [xp]);
}
