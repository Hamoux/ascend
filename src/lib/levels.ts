/** XP / leveling model. Level (progression) is driven by lifetime points earned. */

export interface LevelInfo {
  level: number;
  title: string;
  /** XP accumulated inside the current level. */
  xpIntoLevel: number;
  /** XP required to advance from the current level to the next. */
  xpForLevel: number;
  /** 0..1 progress through the current level. */
  progress: number;
  totalXp: number;
}

/** XP needed to advance *from* a given level. Grows linearly for a gentle curve. */
function requirementFor(level: number): number {
  return 100 + (level - 1) * 40;
}

const TITLES: Array<{ min: number; title: string }> = [
  { min: 65, title: 'Legend' },
  { min: 45, title: 'Grandmaster' },
  { min: 30, title: 'Master' },
  { min: 20, title: 'Expert' },
  { min: 13, title: 'Strategist' },
  { min: 8, title: 'Adept' },
  { min: 4, title: 'Apprentice' },
  { min: 1, title: 'Initiate' },
];

export function titleForLevel(level: number): string {
  return TITLES.find((t) => level >= t.min)?.title ?? 'Initiate';
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  let need = requirementFor(level);
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = requirementFor(level);
  }
  return {
    level,
    title: titleForLevel(level),
    xpIntoLevel: remaining,
    xpForLevel: need,
    progress: need === 0 ? 0 : remaining / need,
    totalXp: Math.max(0, Math.floor(totalXp)),
  };
}
