import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useLevel } from '@/store/derived';
import { useT } from '@/i18n/useT';
import type { TKey } from '@/i18n';
import { NAV_ITEMS } from '@/components/layout/navItems';
import { ProgressBar } from '@/components/ui/Progress/Progress';
import { initialsOf } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const profile = useStore((s) => s.profile);
  const level = useLevel();
  const { t } = useT();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" aria-hidden>
            <path d="M16 5 L26 25 H6 Z" fill="url(#brandGrad)" />
            <path d="M16 13 L21 23 H11 Z" fill="#0a0a12" />
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7c6cff" />
                <stop offset="1" stopColor="#d96cff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className={styles.brandText}>
          <span className={styles.wordmark}>Ascend</span>
          <span className={styles.tagline}>{t('brand.tagline')}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = view === item.view;
          return (
            <button key={item.view} className={cx(styles.navItem, active && styles.active)} onClick={() => setView(item.view)}>
              {active && (
                <motion.span layoutId="nav-active" className={styles.navIndicator} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
              )}
              <item.icon className={styles.navIcon} />
              <span className={styles.navLabel}>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <button className={styles.levelCard} onClick={() => setView('settings')}>
        <div className={styles.avatar}>{initialsOf(profile.name)}</div>
        <div className={styles.levelInfo}>
          <div className={styles.levelTop}>
            <span className={styles.levelName}>{profile.name}</span>
            <span className={styles.levelTag}>{t('common.lv')} {level.level}</span>
          </div>
          <ProgressBar value={level.progress} height={6} tone="brand" />
          <span className={styles.levelSub}>
            {t(`level.${level.title}` as TKey)} · {level.xpIntoLevel}/{level.xpForLevel} XP
          </span>
        </div>
      </button>
    </aside>
  );
}
