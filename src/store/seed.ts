/** First-run demo data: realistic habits with ~7 weeks of history so the UI feels alive. */
import type { Habit, LogEntry, Punishment, Redemption, Reward } from '@/types';
import { uid } from '@/lib/id';
import { addDays, toISODate } from '@/lib/date';

interface SeedHabit extends Habit {
  /** Completion likelihood used only by the seed generator. */
  _rate: number;
  _weekday?: number;
}

const DAYS = 48;

export function createSeed(): {
  habits: Habit[];
  logs: LogEntry[];
  rewards: Reward[];
  redemptions: Redemption[];
  punishments: Punishment[];
} {
  const now = Date.now();
  const createdAt = now - 50 * 86_400_000;

  const defs: SeedHabit[] = [
    h('Morning workout', 'fitness', '💪', 'daily', 15, 10, 0.86, 'Sweat first thing — no excuses.'),
    h('Drink 2L water', 'health', '💧', 'daily', 8, 5, 0.9),
    h('Read 20 pages', 'learning', '📚', 'daily', 10, 6, 0.78, 'Fiction or non-fiction, anything counts.'),
    h('Meditate 10 min', 'mindfulness', '🧘', 'daily', 10, 5, 0.82),
    h('Deep work block', 'productivity', '⚡', 'daily', 18, 10, 0.8, 'Two focused hours, phone in another room.'),
    h('No junk food', 'nutrition', '🥗', 'daily', 12, 12, 0.72),
    h('Sleep before midnight', 'sleep', '😴', 'daily', 10, 8, 0.76),
    h('Weekly review', 'productivity', '📝', 'weekly', 30, 12, 0.85, 'Plan the week, review goals.', 0),
    h('Call family', 'social', '🫂', 'weekly', 22, 8, 0.8, undefined, 6),
  ];

  const portfolio = h('Finish portfolio site', 'creativity', '🎨', 'yearly', 150, 0, 1, 'One-time launch goal.');
  portfolio.kind = 'one-time';

  const homeGym = h('Set up home gym', 'fitness', '🏋️', 'monthly', 90, 0, 1);
  homeGym.kind = 'one-time';
  homeGym.archivedAt = now - 12 * 86_400_000;

  const habits: Habit[] = [...defs, portfolio, homeGym].map(strip);
  const logs: LogEntry[] = [];

  // One-time task that was completed ~12 days ago.
  logs.push(makeLog(homeGym, 'complete', 12));

  for (let ago = DAYS - 1; ago >= 0; ago--) {
    const date = toISODate(addDays(new Date(), -ago));
    const weekday = new Date(`${date}T00:00:00`).getDay();
    for (const def of defs) {
      if (def.frequency === 'weekly') {
        if (weekday !== def._weekday) continue;
        if (Math.random() < def._rate) logs.push(makeLogOn(def, 'complete', date));
        else logs.push(makeLogOn(def, 'skip', date));
        continue;
      }
      const r = Math.random();
      const rate = ago <= 5 ? Math.min(0.96, def._rate + 0.12) : def._rate;
      if (r < 0.08) continue; // missed entirely (no log)
      if (r < rate) logs.push(makeLogOn(def, 'complete', date));
      else logs.push(makeLogOn(def, 'skip', date));
    }
  }

  const rewards: Reward[] = [
    reward('Movie night', 'entertainment', '🍿', 150, 'Big screen, snacks, no chores.'),
    reward('Cheat meal', 'food', '🍔', 220, 'Whatever you have been craving.'),
    reward('New video game', 'gaming', '🎮', 800, 'That release on your wishlist.'),
    reward('Premium headphones', 'tech', '🎧', 1600, 'Noise-cancelling upgrade.'),
    reward('Spa & massage', 'wellness', '💆', 650, '90 minutes of pure reset.'),
    reward('Weekend getaway', 'travel', '✈️', 4200, 'Two nights somewhere new.'),
  ];

  const redemptions: Redemption[] = [
    {
      id: uid('rdm'),
      rewardId: rewards[0].id,
      rewardName: rewards[0].name,
      rewardIcon: rewards[0].icon,
      cost: rewards[0].cost,
      createdAt: now - 9 * 86_400_000,
    },
  ];

  const punishments: Punishment[] = [
    {
      id: uid('pun'),
      name: '50 burpees',
      description: 'Pay the debt physically when you go into the red.',
      trigger: 'balance-below',
      threshold: 0,
      icon: '🔥',
      createdAt,
    },
    {
      id: uid('pun'),
      name: 'No screen after 9pm',
      description: 'Triggered after too many skips in a week.',
      trigger: 'skip-streak',
      threshold: 6,
      icon: '📵',
      createdAt,
    },
  ];

  return { habits, logs, rewards, redemptions, punishments };

  /* ---- local builders (close over createdAt) ---- */
  function h(
    name: string,
    category: string,
    icon: string,
    frequency: Habit['frequency'],
    pos: number,
    neg: number,
    rate: number,
    description?: string,
    weekday?: number,
  ): SeedHabit {
    return {
      id: uid('habit'),
      name,
      description,
      category,
      icon,
      frequency,
      kind: 'recurring',
      positivePoints: pos,
      negativePoints: neg,
      createdAt,
      _rate: rate,
      _weekday: weekday,
    };
  }
}

function strip(h: SeedHabit): Habit {
  const { _rate, _weekday, ...rest } = h;
  void _rate;
  void _weekday;
  return rest;
}

function makeLogOn(habit: Habit, type: 'complete' | 'skip', date: string): LogEntry {
  const base = new Date(`${date}T00:00:00`).getTime();
  const points = type === 'complete' ? habit.positivePoints : -habit.negativePoints;
  return {
    id: uid('log'),
    habitId: habit.id,
    habitName: habit.name,
    habitIcon: habit.icon,
    type,
    points,
    date,
    createdAt: base + (8 + Math.floor(Math.random() * 12)) * 3_600_000,
  };
}

function makeLog(habit: Habit, type: 'complete' | 'skip', daysAgo: number): LogEntry {
  return makeLogOn(habit, type, toISODate(addDays(new Date(), -daysAgo)));
}

function reward(
  name: string,
  category: string,
  icon: string,
  cost: number,
  description: string,
): Reward {
  return { id: uid('rwd'), name, category, icon, cost, description, createdAt: Date.now() };
}
