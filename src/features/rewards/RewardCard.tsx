import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Coins, Lock, Pencil, Sparkles, Trash2 } from 'lucide-react';
import type { Reward } from '@/types';
import { useStore } from '@/store/useStore';
import { useBalance } from '@/store/derived';
import { useUI } from '@/components/layout/UIProvider';
import { Badge, Button, Card, IconButton, ProgressBar, useConfirm } from '@/components/ui';
import { Confetti } from '@/components/common/Confetti';
import { rewardCategory } from '@/lib/constants';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { clamp, formatNumber } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './RewardCard.module.css';

export function RewardCard({ reward }: { reward: Reward }) {
  const balance = useBalance();
  const redeemReward = useStore((s) => s.redeemReward);
  const deleteReward = useStore((s) => s.deleteReward);
  const { openRewardForm } = useUI();
  const confirm = useConfirm();
  const { t } = useT();
  const [fireKey, setFireKey] = useState(0);

  const cat = rewardCategory(reward.category);
  const affordable = balance >= reward.cost;
  const progress = clamp(balance / reward.cost, 0, 1);
  const remaining = Math.max(0, reward.cost - balance);

  const onRedeem = async () => {
    const ok = await confirm({
      title: t('rcard.confirm_title', { name: reward.name }),
      message: t('rcard.confirm_msg', { n: formatNumber(reward.cost) }),
      confirmLabel: t('confirm.redeem'),
      icon: <Sparkles />,
    });
    if (ok && redeemReward(reward.id)) setFireKey((k) => k + 1);
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: t('rcard.delete_title'),
      message: t('rcard.delete_msg', { name: reward.name }),
      confirmLabel: t('confirm.delete'),
      tone: 'danger',
      icon: <Trash2 />,
    });
    if (ok) deleteReward(reward.id);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
      <Card pad="none" className={cx(styles.card, affordable && styles.ready)} style={{ '--accent': cat.color } as CSSProperties}>
        <Confetti fireKey={fireKey} />
        <div
          className={styles.cover}
          style={reward.image ? { backgroundImage: `url(${reward.image})` } : undefined}
        >
          {!reward.image && <span className={styles.coverEmoji}>{reward.icon}</span>}
          <div className={styles.coverOverlay} />
          <div className={styles.menu}>
            <IconButton label={t('common.edit')} size="sm" variant="surface" onClick={() => openRewardForm(reward)}>
              <Pencil />
            </IconButton>
            <IconButton label={t('confirm.delete')} size="sm" variant="surface" onClick={onDelete}>
              <Trash2 />
            </IconButton>
          </div>
          <div className={styles.costTag}>
            <Coins className={styles.coin} />
            {formatNumber(reward.cost)}
          </div>
          {affordable && <Badge tone="success" className={styles.readyTag}>{t('rcard.affordable')}</Badge>}
        </div>

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{reward.name}</h3>
            <Badge color={cat.color}>{t(`rcat.${cat.id}` as TKey)}</Badge>
          </div>
          {reward.description && <p className={styles.desc}>{reward.description}</p>}

          <div className={styles.footer}>
            {affordable ? (
              <Button variant="success" fullWidth icon={<Sparkles />} onClick={onRedeem}>
                {t('rcard.redeem')}
              </Button>
            ) : (
              <div className={styles.locked}>
                <div className={styles.lockedTop}>
                  <span className={styles.lockedLabel}>
                    <Lock className={styles.lock} /> {t('rcard.to_go', { n: formatNumber(remaining) })}
                  </span>
                  <span className={styles.lockedPct}>{Math.round(progress * 100)}%</span>
                </div>
                <ProgressBar value={progress} tone="gold" height={8} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
