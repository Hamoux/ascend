import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
  pad?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Card({ interactive, glow, pad = 'md', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(styles.card, styles[`pad_${pad}`], interactive && styles.interactive, glow && styles.glow, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
