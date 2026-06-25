import { motion } from 'framer-motion';
import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  fluid?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  fluid,
}: SegmentedControlProps<T>) {
  const groupId = useId();
  return (
    <div className={cx(styles.group, styles[size], fluid && styles.fluid, className)} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            className={cx(styles.segment, active && styles.active)}
            onClick={() => onChange(opt.value)}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                className={styles.indicator}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {opt.icon && <span className={styles.segIcon}>{opt.icon}</span>}
            <span className={styles.segLabel}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
