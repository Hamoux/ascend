import { useMemo, useState } from 'react';
import { Coins, Gift, History, Plus, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBalance } from '@/store/derived';
import { useUI } from '@/components/layout/UIProvider';
import { Button, Card, EmptyState, Select, TextInput } from '@/components/ui';
import { SectionHeader } from '@/components/common/SectionHeader';
import { REWARD_CATEGORIES, rewardCategory } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { RewardCard } from './RewardCard';
import { formatNumber } from '@/lib/format';
import styles from './RewardsPage.module.css';

type Sort = 'affordable' | 'cost-asc' | 'cost-desc' | 'name' | 'recent';

export function RewardsPage() {
  const rewards = useStore((s) => s.rewards);
  const redemptions = useStore((s) => s.redemptions);
  const balance = useBalance();
  const { openRewardForm } = useUI();
  const { t, tn, fmtRelative } = useT();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<Sort>('affordable');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rewards.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (q && !`${r.name} ${r.description ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return list.sort((a, b) => {
      switch (sort) {
        case 'cost-asc':
          return a.cost - b.cost;
        case 'cost-desc':
          return b.cost - a.cost;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return b.createdAt - a.createdAt;
        default: {
          const aff = Number(balance >= b.cost) - Number(balance >= a.cost);
          return aff !== 0 ? aff : a.cost - b.cost;
        }
      }
    });
  }, [rewards, query, category, sort, balance]);

  const unlockable = rewards.filter((r) => balance >= r.cost).length;

  return (
    <div className={styles.page}>
      <Card pad="md" className={styles.banner}>
        <div className={styles.bannerLeft}>
          <span className={styles.bannerIcon}>
            <Coins />
          </span>
          <div>
            <p className={styles.bannerLabel}>{t('rewards.spendable')}</p>
            <p className={styles.bannerValue}>{formatNumber(balance)} {t('common.pts')}</p>
          </div>
        </div>
        <div className={styles.bannerStats}>
          <div>
            <span className={styles.bannerNum}>{rewards.length}</span>
            <span className={styles.bannerSub}>{t('rewards.rewards')}</span>
          </div>
          <div className={styles.divider} />
          <div>
            <span className={styles.bannerNum}>{unlockable}</span>
            <span className={styles.bannerSub}>{t('rewards.unlockable')}</span>
          </div>
        </div>
      </Card>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextInput prefix={<Search />} placeholder={t('rewards.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('rform.category')}>
          <option value="all">{t('habits.all_categories')}</option>
          {REWARD_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon}  {t(`rcat.${c.id}` as TKey)}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="affordable">{t('rewards.sort.affordable')}</option>
          <option value="cost-asc">{t('rewards.sort.cost_asc')}</option>
          <option value="cost-desc">{t('rewards.sort.cost_desc')}</option>
          <option value="name">{t('rewards.sort.name')}</option>
          <option value="recent">{t('rewards.sort.recent')}</option>
        </Select>
        <Button icon={<Plus />} onClick={() => openRewardForm()} className={styles.newBtn}>
          {t('rewards.new')}
        </Button>
      </div>

      {rewards.length === 0 ? (
        <EmptyState
          icon={<Gift />}
          title={t('rewards.empty_title')}
          description={t('rewards.empty_desc')}
          action={<Button icon={<Plus />} onClick={() => openRewardForm()}>{t('rewards.empty_cta')}</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title={t('rewards.no_match_title')} description={t('rewards.no_match_desc')} />
      ) : (
        <div className={styles.grid}>
          {filtered.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}

      {redemptions.length > 0 && (
        <Card pad="md" className={styles.history}>
          <SectionHeader icon={<History />} title={t('rewards.history_title')} subtitle={tn(redemptions.length, 'unit.reward')} />
          <ul className={styles.historyList}>
            {redemptions.slice(0, 12).map((r) => (
              <li key={r.id} className={styles.historyRow}>
                <span className={styles.historyIcon}>{r.rewardIcon}</span>
                <div className={styles.historyInfo}>
                  <span className={styles.historyName}>{r.rewardName}</span>
                  <span className={styles.historyMeta}>
                    {t(`rcat.${rewardCategory(rewards.find((rw) => rw.id === r.rewardId)?.category ?? '').id}` as TKey)} · {fmtRelative(r.createdAt)}
                  </span>
                </div>
                <span className={styles.historyCost}>−{formatNumber(r.cost)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
