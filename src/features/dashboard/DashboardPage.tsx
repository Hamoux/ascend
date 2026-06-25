import { useMemo } from 'react';
import { Flame, Target, Trophy, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useLevel } from '@/store/derived';
import { activityStreak, lifetimeEarned, rangeStats } from '@/store/selectors';
import { StatCard } from '@/components/common/StatCard';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { DashboardHero } from './DashboardHero';
import { MomentumChart } from './MomentumChart';
import { TodayFocus } from './TodayFocus';
import { RecentActivity } from './RecentActivity';
import { PunishmentsBanner } from '@/features/punishments/PunishmentsBanner';
import { lastNDays, parseISO, todayISO } from '@/lib/date';
import { formatCompact, percent, signed } from '@/lib/format';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const logs = useStore((s) => s.logs);
  const level = useLevel();
  const { t } = useT();

  const stats = useMemo(() => {
    const today = rangeStats(logs, parseISO(todayISO()));
    const month = rangeStats(logs, parseISO(lastNDays(30)[0]));
    return {
      today,
      streak: activityStreak(logs),
      rate: month.rate,
      logged: month.completes + month.skips,
      completes: month.completes,
      earned: lifetimeEarned(logs),
    };
  }, [logs]);

  return (
    <div className={styles.page}>
      <DashboardHero />

      <PunishmentsBanner />

      <div className={styles.stats}>
        <StatCard
          icon={<Zap />}
          label={t('stat.net_today')}
          value={signed(stats.today.net)}
          accent="#ffcf6b"
          sub={t('stat.done_skipped', { done: stats.today.completes, skipped: stats.today.skips })}
          delay={0.04}
        />
        <StatCard
          icon={<Flame />}
          label={t('stat.current_streak')}
          value={`${stats.streak.current}${t('common.day_abbr')}`}
          accent="#fb923c"
          sub={t('stat.best_days', { n: stats.streak.longest })}
          delay={0.08}
        />
        <StatCard
          icon={<Target />}
          label={t('stat.30day_rate')}
          value={percent(stats.rate)}
          accent="#34d399"
          sub={t('stat.logged', { done: stats.completes, total: stats.logged })}
          delay={0.12}
        />
        <StatCard
          icon={<Trophy />}
          label={t('stat.lifetime_earned')}
          value={formatCompact(stats.earned)}
          accent="#7c6cff"
          sub={`${t(`level.${level.title}` as TKey)} · ${t('common.lv')} ${level.level}`}
          delay={0.16}
        />
      </div>

      <MomentumChart />

      <div className={styles.split}>
        <TodayFocus />
        <RecentActivity />
      </div>
    </div>
  );
}
