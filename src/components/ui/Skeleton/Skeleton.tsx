import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, radius = 'var(--r-sm)', className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return <span className={cx(styles.skeleton, className)} style={style} />;
}
