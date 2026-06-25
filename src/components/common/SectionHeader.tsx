import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon, title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cx(styles.header, className)}>
      <div className={styles.left}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
