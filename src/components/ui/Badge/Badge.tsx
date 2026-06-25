import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Badge.module.css';

type Tone = 'neutral' | 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'gold';

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  /** Override accent with an arbitrary color (e.g. a category color). */
  color?: string;
  soft?: boolean;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, color, soft = true, className }: BadgeProps) {
  const style = color ? ({ '--badge-accent': color } as CSSProperties) : undefined;
  return (
    <span
      className={cx(styles.badge, styles[tone], soft && styles.soft, color && styles.custom, className)}
      style={style}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
