import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cumulativeSeries } from '@/store/selectors';
import { AreaChart, type AreaPoint } from '@/components/charts/AreaChart';
import { Card, SegmentedControl } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { formatNumber, signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './MomentumChart.module.css';

type Range = '14' | '30' | '90';

export function MomentumChart() {
  const logs = useStore((s) => s.logs);
  const { t, fmtDate } = useT();
  const [range, setRange] = useState<Range>('30');
  const days = Number(range);

  const { points, delta } = useMemo(() => {
    const series = cumulativeSeries(logs, days);
    const pts: AreaPoint[] = series.map((d) => ({
      label: d.iso,
      value: d.value,
      caption: fmtDate(d.iso, { year: true }),
    }));
    const change = series.length ? series[series.length - 1].value - series[0].value : 0;
    return { points: pts, delta: change };
  }, [logs, days]);

  const Trend = delta < 0 ? TrendingDown : TrendingUp;

  return (
    <Card pad="md" className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>{t('momentum.title')}</h2>
          <p className={styles.sub}>
            {t('momentum.balance_over', { n: days })}
            <span className={cx(styles.delta, delta < 0 ? styles.down : styles.up)}>
              <Trend /> {signed(delta)}
            </span>
          </p>
        </div>
        <SegmentedControl
          size="sm"
          options={[
            { value: '14', label: `14${t('common.day_abbr')}` },
            { value: '30', label: `30${t('common.day_abbr')}` },
            { value: '90', label: `90${t('common.day_abbr')}` },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>
      <AreaChart data={points} height={220} tone="brand" formatValue={(n) => `${formatNumber(n)} ${t('common.pts')}`} />
    </Card>
  );
}
