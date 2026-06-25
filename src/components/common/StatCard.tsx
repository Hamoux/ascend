import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { cx } from '@/lib/cx';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
  delay?: number;
}

export function StatCard({ icon, label, value, sub, accent = '#7c6cff', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={styles.card} style={{ '--accent': accent } as CSSProperties}>
        <div className={styles.top}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {sub && <div className={cx(styles.sub)}>{sub}</div>}
      </Card>
    </motion.div>
  );
}
