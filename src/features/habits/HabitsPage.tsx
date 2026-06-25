import { useMemo, useState } from 'react';
import { Plus, Search, Target } from 'lucide-react';
import type { Habit } from '@/types';
import { useStore } from '@/store/useStore';
import { habitStats } from '@/store/selectors';
import { useUI } from '@/components/layout/UIProvider';
import { Button, Card, EmptyState, SegmentedControl, Select, TextInput } from '@/components/ui';
import { HABIT_CATEGORIES, FREQUENCY_OPTIONS } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { HabitCard } from './HabitCard';
import { HabitHistory } from './HabitHistory';
import styles from './HabitsPage.module.css';

type Status = 'active' | 'completed' | 'all';
type Sort = 'recent' | 'name' | 'streak' | 'rate' | 'net';

export function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.logs);
  const { openHabitForm } = useUI();
  const { t, tn } = useT();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [category, setCategory] = useState('all');
  const [frequency, setFrequency] = useState('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = habits.filter((h) => {
      if (status === 'active' && h.archivedAt) return false;
      if (status === 'completed' && !h.archivedAt) return false;
      if (category !== 'all' && h.category !== category) return false;
      if (frequency !== 'all' && h.frequency !== frequency) return false;
      if (q && !`${h.name} ${h.description ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return list.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return habitStats(b, logs).current - habitStats(a, logs).current;
        case 'rate':
          return habitStats(b, logs).rate - habitStats(a, logs).rate;
        case 'net':
          return habitStats(b, logs).net - habitStats(a, logs).net;
        default:
          return b.createdAt - a.createdAt;
      }
    });
  }, [habits, logs, query, status, category, frequency, sort]);

  const hasHabits = habits.length > 0;

  return (
    <div className={styles.page}>
      <Card pad="sm" className={styles.toolbar}>
        <div className={styles.search}>
          <TextInput
            prefix={<Search />}
            placeholder={t('habits.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('hform.category')}>
            <option value="all">{t('habits.all_categories')}</option>
            {HABIT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon}  {t(`cat.${c.id}` as TKey)}
              </option>
            ))}
          </Select>
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} aria-label={t('hform.frequency')}>
            <option value="all">{t('habits.any_frequency')}</option>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {t(`freq.${f.value}` as TKey)}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="recent">{t('habits.sort.recent')}</option>
            <option value="name">{t('habits.sort.name')}</option>
            <option value="streak">{t('habits.sort.streak')}</option>
            <option value="rate">{t('habits.sort.rate')}</option>
            <option value="net">{t('habits.sort.net')}</option>
          </Select>
        </div>
      </Card>

      <div className={styles.subbar}>
        <SegmentedControl
          options={[
            { value: 'active', label: t('habits.status.active') },
            { value: 'completed', label: t('habits.status.completed') },
            { value: 'all', label: t('habits.status.all') },
          ]}
          value={status}
          onChange={setStatus}
        />
        <span className={styles.count}>{tn(filtered.length, 'unit.habit')}</span>
        <Button icon={<Plus />} onClick={() => openHabitForm()} className={styles.newBtn}>
          {t('common.new_habit')}
        </Button>
      </div>

      {!hasHabits ? (
        <EmptyState
          icon={<Target />}
          title={t('habits.empty_title')}
          description={t('habits.empty_desc')}
          action={<Button icon={<Plus />} onClick={() => openHabitForm()}>{t('habits.empty_cta')}</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title={t('habits.no_match_title')} description={t('habits.no_match_desc')} />
      ) : (
        <div className={styles.grid}>
          {filtered.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onHistory={setHistoryHabit} />
          ))}
        </div>
      )}

      <HabitHistory habit={historyHabit} onClose={() => setHistoryHabit(null)} />
    </div>
  );
}
