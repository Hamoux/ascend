import { useMemo } from 'react';
import { Coins, Flame, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBalance, useLevel } from '@/store/derived';
import { activityStreak, currentPeriodLog, rangeStats } from '@/store/selectors';
import { useCountUp } from '@/hooks/useCountUp';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { Card, ProgressBar, RingProgress } from '@/components/ui';
import { formatNumber, percent, signed } from '@/lib/format';
import { parseISO, todayISO } from '@/lib/date';
import styles from './DashboardHero.module.css';

function motivationKey(ring: number, streak: number, net: number): TKey {
  if (ring >= 1) return 'dash.motiv.flawless';
  if (ring >= 0.7) return 'dash.motiv.fire';
  if (streak >= 3) return 'dash.motiv.streak';
  if (net < 0) return 'dash.motiv.rough';
  if (ring > 0) return 'dash.motiv.start';
  return 'dash.motiv.begin';
}

export function DashboardHero() {
  const profile = useStore((s) => s.profile);
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.logs);
  const balance = useBalance();
  const level = useLevel();
  const animatedBalance = useCountUp(balance);
  const { t, tn } = useT();

  const { ring, done, total, todayNet, streak } = useMemo(() => {
    const active = habits.filter((h) => !h.archivedAt);
    const completed = active.filter((h) => currentPeriodLog(h, logs)?.type === 'complete').length;
    const today = rangeStats(logs, parseISO(todayISO()));
    return {
      ring: active.length ? completed / active.length : 0,
      done: completed,
      total: active.length,
      todayNet: today.net,
      streak: activityStreak(logs).current,
    };
  }, [habits, logs]);

  const TodayTrend = todayNet < 0 ? TrendingDown : TrendingUp;

  return (
    <Card glow pad="lg" className={styles.hero}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.left}>
        <p className={styles.overline}>
          <Sparkles className={styles.sparkle} /> {t('dash.welcome', { name: profile.name })}
        </p>

        <div className={styles.balanceBlock}>
          <span className={styles.balanceLabel}>{t('dash.point_balance')}</span>
          <div className={styles.balanceRow}>
            <Coins className={styles.coin} />
            <span className={styles.balance}>{formatNumber(animatedBalance)}</span>
          </div>
        </div>

        <div className={styles.chips}>
          <span className={styles.chip}>
            <Flame className={styles.chipFlame} />
            {t('dash.streak', { n: tn(streak, 'unit.day') })}
          </span>
          <span className={styles.chip}>
            <TodayTrend className={todayNet < 0 ? styles.down : styles.up} />
            {t('dash.today_delta', { v: signed(todayNet) })}
          </span>
        </div>

        <div className={styles.levelBlock}>
          <div className={styles.levelTop}>
            <span className={styles.levelBadge}>{t('common.lv')} {level.level}</span>
            <span className={styles.levelTitle}>{t(`level.${level.title}` as TKey)}</span>
            <span className={styles.levelXp}>
              {t('dash.xp_to_level', { n: formatNumber(level.xpForLevel - level.xpIntoLevel), lvl: level.level + 1 })}
            </span>
          </div>
          <ProgressBar value={level.progress} height={9} />
        </div>

        <p className={styles.motivation}>{t(motivationKey(ring, streak, todayNet), { n: streak })}</p>
      </div>

      <div className={styles.right}>
        <RingProgress value={ring} size={172} stroke={14} tone={ring >= 0.7 ? 'success' : 'brand'}>
          <div className={styles.ringCenter}>
            <span className={styles.ringPct}>{percent(ring)}</span>
            <span className={styles.ringLabel}>{t('dash.completed')}</span>
          </div>
        </RingProgress>
        <p className={styles.ringSub}>{t('dash.habits_done', { done, total })}</p>
      </div>
    </Card>
  );
}
