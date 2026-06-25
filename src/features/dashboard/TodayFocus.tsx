import { useMemo } from 'react';
import { ArrowRight, Check, ListChecks, X } from 'lucide-react';
import type { Habit } from '@/types';
import { useStore } from '@/store/useStore';
import { currentPeriodLog } from '@/store/selectors';
import { habitCategory } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { Button, Card, EmptyState } from '@/components/ui';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useUI } from '@/components/layout/UIProvider';
import { cx } from '@/lib/cx';
import styles from './TodayFocus.module.css';

function FocusRow({ habit }: { habit: Habit }) {
  const logs = useStore((s) => s.logs);
  const completeHabit = useStore((s) => s.completeHabit);
  const skipHabit = useStore((s) => s.skipHabit);
  const { t } = useT();
  const state = currentPeriodLog(habit, logs)?.type;
  const cat = habitCategory(habit.category);

  return (
    <div className={styles.row}>
      <span className={styles.emoji} style={{ background: `color-mix(in srgb, ${cat.color} 16%, transparent)` }}>
        {habit.icon}
      </span>
      <div className={styles.info}>
        <span className={styles.name}>{habit.name}</span>
        <span className={styles.meta}>
          {t(`cat.${cat.id}` as TKey)} · {t(`freq.every.${habit.frequency}` as TKey)} · <span className={styles.pos}>+{habit.positivePoints}</span>
        </span>
      </div>
      <div className={styles.controls}>
        <button
          className={cx(styles.ctrl, styles.complete, state === 'complete' && styles.activeComplete)}
          onClick={() => completeHabit(habit.id)}
          aria-label="Mark complete"
        >
          <Check />
        </button>
        <button
          className={cx(styles.ctrl, styles.skip, state === 'skip' && styles.activeSkip)}
          onClick={() => skipHabit(habit.id)}
          aria-label="Mark skipped"
        >
          <X />
        </button>
      </div>
    </div>
  );
}

export function TodayFocus() {
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.logs);
  const setView = useStore((s) => s.setView);
  const { openHabitForm } = useUI();
  const { t } = useT();

  const { pending, done, total } = useMemo(() => {
    const active = habits.filter((h) => !h.archivedAt);
    const pendingList = active
      .filter((h) => currentPeriodLog(h, logs)?.type !== 'complete')
      .sort((a, b) => {
        const aSkip = currentPeriodLog(a, logs)?.type === 'skip' ? 1 : 0;
        const bSkip = currentPeriodLog(b, logs)?.type === 'skip' ? 1 : 0;
        return aSkip - bSkip;
      });
    const doneCount = active.length - pendingList.length;
    return { pending: pendingList, done: doneCount, total: active.length };
  }, [habits, logs]);

  return (
    <Card pad="md" className={styles.card}>
      <SectionHeader
        icon={<ListChecks />}
        title={t('today.title')}
        subtitle={total > 0 ? t('today.subtitle', { done, total }) : t('today.nothing')}
        action={
          habits.length > 0 ? (
            <Button variant="ghost" size="sm" iconRight={<ArrowRight />} onClick={() => setView('habits')}>
              {t('common.view_all')}
            </Button>
          ) : undefined
        }
      />
      {habits.length === 0 ? (
        <EmptyState
          compact
          icon="🎯"
          title={t('today.no_habits_title')}
          description={t('today.no_habits_desc')}
          action={<Button onClick={() => openHabitForm()}>{t('today.create')}</Button>}
        />
      ) : pending.length === 0 ? (
        <EmptyState compact icon="🎉" title={t('today.clear_title')} description={t('today.clear_desc')} />
      ) : (
        <div className={styles.list}>
          {pending.slice(0, 7).map((h) => (
            <FocusRow key={h.id} habit={h} />
          ))}
          {pending.length > 7 && (
            <button className={styles.more} onClick={() => setView('habits')}>
              {t('today.more', { n: pending.length - 7 })}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
