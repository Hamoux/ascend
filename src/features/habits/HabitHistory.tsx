import { useMemo } from 'react';
import { History, Trash2 } from 'lucide-react';
import type { Habit } from '@/types';
import { useStore } from '@/store/useStore';
import { logsForHabit } from '@/store/selectors';
import { EmptyState, IconButton, Modal } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './HabitHistory.module.css';

interface HabitHistoryProps {
  habit: Habit | null;
  onClose: () => void;
}

export function HabitHistory({ habit, onClose }: HabitHistoryProps) {
  const logs = useStore((s) => s.logs);
  const deleteLog = useStore((s) => s.deleteLog);
  const { t, fmtDate, fmtTime } = useT();

  const entries = useMemo(() => {
    if (!habit) return [];
    return logsForHabit(habit.id, logs).sort((a, b) => b.createdAt - a.createdAt);
  }, [habit, logs]);

  return (
    <Modal
      open={habit !== null}
      onClose={onClose}
      icon={<History />}
      title={habit ? `${habit.icon}  ${habit.name}` : t('common.history')}
      subtitle={t('history.sub')}
      size="md"
    >
      {entries.length === 0 ? (
        <EmptyState compact icon="🗓️" title={t('history.empty_title')} description={t('history.empty_desc')} />
      ) : (
        <ul className={styles.list}>
          {entries.map((log) => {
            const positive = log.type === 'complete';
            return (
              <li key={log.id} className={styles.row}>
                <span className={cx(styles.badge, positive ? styles.up : styles.down)}>{positive ? t('common.completed') : t('common.skipped')}</span>
                <div className={styles.when}>
                  <span className={styles.date}>{fmtDate(log.date, { year: true })}</span>
                  <span className={styles.time}>{fmtTime(log.createdAt)}</span>
                </div>
                <span className={cx(styles.points, positive ? styles.up : styles.down)}>{signed(log.points)}</span>
                <IconButton label={t('confirm.delete')} variant="danger" size="sm" onClick={() => deleteLog(log.id)}>
                  <Trash2 />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
