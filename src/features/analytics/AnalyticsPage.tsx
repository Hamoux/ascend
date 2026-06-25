import { useMemo, useState } from 'react';
import { Award, Flame, Target, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  activityStreak,
  mostCompleted,
  mostSkipped,
  rangeStats,
  rollupByHabit,
  weeklySeries,
} from '@/store/selectors';
import { BarChart } from '@/components/charts/BarChart';
import { Card, EmptyState, ProgressBar, RingProgress, SegmentedControl } from '@/components/ui';
import { StatCard } from '@/components/common/StatCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useT } from '@/i18n/useT';
import { lastNDays, parseISO } from '@/lib/date';
import { clamp, formatNumber, percent, signed } from '@/lib/format';
import styles from './AnalyticsPage.module.css';

type Range = '30' | '90' | '365';

const RANGE_DAYS: Record<Range, number> = { '30': 30, '90': 90, '365': 365 };

export function AnalyticsPage() {
  const logs = useStore((s) => s.logs);
  const { t, tn } = useT();
  const [range, setRange] = useState<Range>('90');

  const data = useMemo(() => {
    const days = RANGE_DAYS[range];
    const startIso = lastNDays(days)[0];
    const rangeLogs = logs.filter((l) => l.date >= startIso);
    const stats = rangeStats(logs, parseISO(startIso));
    const weeks = clamp(Math.round(days / 7), 6, 26);
    return {
      stats,
      streak: activityStreak(logs),
      weekly: weeklySeries(logs, weeks),
      topDone: mostCompleted(rangeLogs),
      topSkip: mostSkipped(rangeLogs),
      breakdown: rollupByHabit(rangeLogs).sort((a, b) => b.completes + b.skips - (a.completes + a.skips)),
    };
  }, [logs, range]);

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Target />}
        title={t('an.empty_title')}
        description={t('an.empty_desc')}
      />
    );
  }

  const maxBreakdown = Math.max(1, ...data.breakdown.map((b) => b.completes + b.skips));

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <SegmentedControl
          options={[
            { value: '30', label: t('an.range.30') },
            { value: '90', label: t('an.range.90') },
            { value: '365', label: t('an.range.365') },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>

      <div className={styles.highlights}>
        <Card pad="md" className={styles.rateCard}>
          <RingProgress value={data.stats.rate} size={104} stroke={11} tone={data.stats.rate >= 0.7 ? 'success' : 'brand'}>
            <span className={styles.ringPct}>{percent(data.stats.rate)}</span>
          </RingProgress>
          <div>
            <p className={styles.rateLabel}>{t('an.completion_rate')}</p>
            <p className={styles.rateSub}>{t('stat.done_skipped', { done: data.stats.completes, skipped: data.stats.skips })}</p>
          </div>
        </Card>
        <StatCard icon={<Flame />} label={t('an.current_streak')} value={`${data.streak.current}${t('common.day_abbr')}`} accent="#fb923c" sub={t('stat.best_days', { n: data.streak.longest })} />
        <StatCard icon={<TrendingUp />} label={t('an.points_earned')} value={`+${formatNumber(data.stats.earned)}`} accent="#34d399" />
        <StatCard icon={<TrendingDown />} label={t('an.points_lost')} value={`−${formatNumber(data.stats.lost)}`} accent="#fb7185" />
      </div>

      <Card pad="md">
        <SectionHeader icon={<TrendingUp />} title={t('an.earned_vs_lost')} subtitle={t('an.weekly_flow')} />
        <BarChart
          data={data.weekly.map((w) => ({ label: w.label, values: [w.earned, w.lost] }))}
          colors={['#34d399', '#fb7185']}
          seriesNames={[t('an.earned'), t('an.lost')]}
          height={240}
          formatValue={(n) => `${formatNumber(n)} ${t('common.pts')}`}
        />
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#34d399' }} /> {t('an.earned')}
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#fb7185' }} /> {t('an.lost')}
          </span>
        </div>
      </Card>

      <div className={styles.duo}>
        <Card pad="md" className={styles.topCard}>
          <span className={styles.topBadge} data-tone="up">
            <Trophy />
          </span>
          <p className={styles.topLabel}>{t('an.most_completed')}</p>
          {data.topDone ? (
            <>
              <p className={styles.topName}>
                <span className={styles.topIcon}>{data.topDone.icon}</span> {data.topDone.name}
              </p>
              <p className={styles.topCount}>{tn(data.topDone.completes, 'unit.completion')}</p>
            </>
          ) : (
            <p className={styles.topEmpty}>{t('an.no_completions')}</p>
          )}
        </Card>
        <Card pad="md" className={styles.topCard}>
          <span className={styles.topBadge} data-tone="down">
            <Award />
          </span>
          <p className={styles.topLabel}>{t('an.most_skipped')}</p>
          {data.topSkip ? (
            <>
              <p className={styles.topName}>
                <span className={styles.topIcon}>{data.topSkip.icon}</span> {data.topSkip.name}
              </p>
              <p className={styles.topCount}>{tn(data.topSkip.skips, 'unit.skip')}</p>
            </>
          ) : (
            <p className={styles.topEmpty}>{t('an.no_skips')}</p>
          )}
        </Card>
      </div>

      <Card pad="md">
        <SectionHeader icon={<Target />} title={t('an.breakdown_title')} subtitle={t('an.breakdown_sub')} />
        <div className={styles.breakdown}>
          {data.breakdown.map((b) => {
            const total = b.completes + b.skips;
            const rate = total ? b.completes / total : 0;
            return (
              <div key={b.habitId} className={styles.bRow}>
                <span className={styles.bIcon}>{b.icon}</span>
                <span className={styles.bName}>{b.name}</span>
                <div className={styles.bBar}>
                  <ProgressBar value={rate} tone={rate >= 0.7 ? 'success' : rate >= 0.4 ? 'gold' : 'danger'} height={7} />
                </div>
                <span className={styles.bRate}>{percent(rate)}</span>
                <span className={styles.bVolume} style={{ opacity: 0.4 + 0.6 * (total / maxBreakdown) }}>
                  {b.completes}/{total}
                </span>
                <span className={styles.bNet} data-neg={b.net < 0}>
                  {signed(b.net)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
