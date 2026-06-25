import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { activePenalties } from '@/store/selectors';
import { useT } from '@/i18n/useT';
import styles from './PunishmentsBanner.module.css';

export function PunishmentsBanner() {
  const punishments = useStore((s) => s.punishments);
  const logs = useStore((s) => s.logs);
  const redemptions = useStore((s) => s.redemptions);
  const { t } = useT();

  const active = useMemo(() => activePenalties(punishments, logs, redemptions), [punishments, logs, redemptions]);
  if (active.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={styles.banner}>
      <span className={styles.icon}>
        <ShieldAlert />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>
          {active.length === 1 ? t('penalty.active_one') : t('penalty.active_many', { n: active.length })}
        </p>
        <div className={styles.list}>
          {active.map(({ punishment, kind, n }) => (
            <span key={punishment.id} className={styles.pill}>
              <span className={styles.pillIcon}>{punishment.icon}</span>
              {punishment.name}
              <span className={styles.detail}>· {kind === 'balance' ? t('penalty.detail.balance', { n }) : t('penalty.detail.skips', { n })}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
