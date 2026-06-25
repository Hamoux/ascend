import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, EmptyState } from '@/components/ui';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useT } from '@/i18n/useT';
import { signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './RecentActivity.module.css';

export function RecentActivity() {
  const logs = useStore((s) => s.logs);
  const { t, fmtRelative } = useT();
  const recent = useMemo(() => [...logs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 9), [logs]);

  return (
    <Card pad="md" className={styles.card}>
      <SectionHeader icon={<Activity />} title={t('activity.title')} />
      {recent.length === 0 ? (
        <EmptyState compact icon="📭" title={t('activity.empty_title')} description={t('activity.empty_desc')} />
      ) : (
        <ul className={styles.timeline}>
          {recent.map((log) => {
            const positive = log.type === 'complete';
            return (
              <li key={log.id} className={styles.item}>
                <span className={cx(styles.dot, positive ? styles.dotUp : styles.dotDown)}>{log.habitIcon}</span>
                <div className={styles.body}>
                  <span className={styles.name}>{log.habitName}</span>
                  <span className={styles.sub}>
                    {positive ? t('common.completed') : t('common.skipped')} · {fmtRelative(log.createdAt)}
                  </span>
                </div>
                <span className={cx(styles.points, positive ? styles.up : styles.down)}>{signed(log.points)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
