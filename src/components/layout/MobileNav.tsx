import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useT } from '@/i18n/useT';
import { NAV_ITEMS } from '@/components/layout/navItems';
import { cx } from '@/lib/cx';
import styles from './MobileNav.module.css';

export function MobileNav() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const { t } = useT();
  const items = NAV_ITEMS.filter((i) => i.primary);

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active = view === item.view;
        return (
          <button key={item.view} className={cx(styles.item, active && styles.active)} onClick={() => setView(item.view)} aria-label={t(item.labelKey)}>
            {active && (
              <motion.span layoutId="mnav-active" className={styles.indicator} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <item.icon className={styles.icon} />
            <span className={styles.label}>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
