import { useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, History, Pencil, RotateCcw, Target, Trash2, X } from 'lucide-react';
import type { Habit } from '@/types';
import { useStore } from '@/store/useStore';
import { currentPeriodLog, habitStats, logsForHabit } from '@/store/selectors';
import { useUI } from '@/components/layout/UIProvider';
import { Badge, Button, Card, IconButton, useConfirm } from '@/components/ui';
import { habitCategory } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { percent, signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './HabitCard.module.css';

interface HabitCardProps {
  habit: Habit;
  onHistory: (habit: Habit) => void;
}

export function HabitCard({ habit, onHistory }: HabitCardProps) {
  const logs = useStore((s) => s.logs);
  const completeHabit = useStore((s) => s.completeHabit);
  const skipHabit = useStore((s) => s.skipHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const restoreHabit = useStore((s) => s.restoreHabit);
  const { openHabitForm } = useUI();
  const confirm = useConfirm();
  const { t } = useT();

  const cat = habitCategory(habit.category);
  const stats = useMemo(() => habitStats(habit, logs), [habit, logs]);
  const isOneTime = habit.kind === 'one-time';
  const archived = Boolean(habit.archivedAt);
  const periodState = currentPeriodLog(habit, logs)?.type;
  const lastOutcome = useMemo(() => {
    if (!archived) return undefined;
    return [...logsForHabit(habit.id, logs)].sort((a, b) => b.createdAt - a.createdAt)[0]?.type;
  }, [archived, habit.id, logs]);

  const onDelete = async () => {
    const ok = await confirm({
      title: t('hcard.delete_title'),
      message: t('hcard.delete_msg', { name: habit.name }),
      confirmLabel: t('confirm.delete'),
      tone: 'danger',
      icon: <Trash2 />,
    });
    if (ok) deleteHabit(habit.id);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
      <Card pad="md" className={cx(styles.card, archived && styles.archived)} style={{ '--accent': cat.color } as CSSProperties}>
        <span className={styles.accentBar} />
        <div className={styles.header}>
          <span className={styles.emoji}>{habit.icon}</span>
          <div className={styles.titleBlock}>
            <h3 className={styles.name}>{habit.name}</h3>
            <div className={styles.badges}>
              <Badge color={cat.color}>{t(`cat.${cat.id}` as TKey)}</Badge>
              <Badge>{isOneTime ? t('kind.one_time') : t(`freq.every.${habit.frequency}` as TKey)}</Badge>
            </div>
          </div>
          <div className={styles.menu}>
            <IconButton label={t('common.history')} size="sm" onClick={() => onHistory(habit)}>
              <History />
            </IconButton>
            <IconButton label={t('common.edit')} size="sm" onClick={() => openHabitForm(habit)}>
              <Pencil />
            </IconButton>
            <IconButton label={t('confirm.delete')} size="sm" variant="danger" onClick={onDelete}>
              <Trash2 />
            </IconButton>
          </div>
        </div>

        {habit.description && <p className={styles.desc}>{habit.description}</p>}

        <div className={styles.stats}>
          {!isOneTime && (
            <>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  <Flame className={styles.flame} /> {stats.current}
                </span>
                <span className={styles.statLabel}>{t('hcard.streak', { adj: t(`freq.adj.${habit.frequency}` as TKey) })}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  <Target className={styles.tgt} /> {percent(stats.rate)}
                </span>
                <span className={styles.statLabel}>{t('hcard.success')}</span>
              </div>
            </>
          )}
          <div className={styles.stat}>
            <span className={cx(styles.statValue, stats.net >= 0 ? styles.up : styles.down)}>{signed(stats.net)}</span>
            <span className={styles.statLabel}>{t('hcard.net_points')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              <span className={styles.up}>{stats.completes}</span>
              <span className={styles.slash}>/</span>
              <span className={styles.down}>{stats.skips}</span>
            </span>
            <span className={styles.statLabel}>{t('hcard.done_skip')}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.points}>
            <span className={styles.gain}>+{habit.positivePoints}</span>
            <span className={styles.loss}>−{habit.negativePoints}</span>
          </div>

          {archived ? (
            <div className={styles.actions}>
              <Badge tone={lastOutcome === 'complete' ? 'success' : 'danger'}>
                {lastOutcome === 'complete' ? t('common.completed') : t('common.skipped')}
              </Badge>
              <Button variant="secondary" size="sm" icon={<RotateCcw />} onClick={() => restoreHabit(habit.id)}>
                {t('common.reopen')}
              </Button>
            </div>
          ) : (
            <div className={styles.actions}>
              <Button
                variant={periodState === 'complete' ? 'success' : 'secondary'}
                size="sm"
                icon={<Check />}
                onClick={() => completeHabit(habit.id)}
              >
                {periodState === 'complete' ? t('common.done') : t('common.complete')}
              </Button>
              <Button
                variant={periodState === 'skip' ? 'danger' : 'ghost'}
                size="sm"
                icon={<X />}
                onClick={() => skipHabit(habit.id)}
              >
                {t('common.skip')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
