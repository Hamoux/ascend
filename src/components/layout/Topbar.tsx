import { Coins, Plus, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useBalance } from '@/store/derived';
import { useUI } from '@/components/layout/UIProvider';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { useCountUp } from '@/hooks/useCountUp';
import { Button, IconButton } from '@/components/ui';
import { formatNumber } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './Topbar.module.css';

function BalancePill() {
  const balance = useBalance();
  const animated = useCountUp(balance);
  const { t } = useT();
  const negative = balance < 0;
  return (
    <div className={cx(styles.balance, negative && styles.balanceNeg)}>
      <span className={styles.coin}>
        <Coins />
      </span>
      <span className={styles.balanceValue}>{formatNumber(animated)}</span>
      <span className={styles.balanceUnit}>{t('common.pts')}</span>
    </div>
  );
}

export function Topbar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const { openHabitForm } = useUI();
  const { t } = useT();

  return (
    <header className={styles.topbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{t(`view.${view}.title` as TKey)}</h1>
        <p className={styles.subtitle}>{t(`view.${view}.subtitle` as TKey)}</p>
      </div>

      <div className={styles.actions}>
        <BalancePill />
        <IconButton label={t('nav.settings')} variant="surface" className={styles.settingsBtn} onClick={() => setView('settings')}>
          <Settings />
        </IconButton>
        <Button icon={<Plus />} onClick={() => openHabitForm()} className={styles.newBtn}>
          <span className={styles.newLabel}>{t('common.new_habit')}</span>
        </Button>
      </div>
    </header>
  );
}
