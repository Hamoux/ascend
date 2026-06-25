import { useId, type CSSProperties, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { clamp } from '@/lib/format';
import styles from './Progress.module.css';

interface ProgressBarProps {
  value: number; // 0..1
  tone?: 'brand' | 'success' | 'danger' | 'gold' | 'cyan';
  height?: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, tone = 'brand', height = 8, color, className }: ProgressBarProps) {
  const pct = clamp(value, 0, 1) * 100;
  const style = {
    height,
    ...(color ? ({ '--bar-fill': color } as CSSProperties) : {}),
  } as CSSProperties;
  return (
    <div className={cx(styles.track, className)} style={style} role="progressbar" aria-valuenow={Math.round(pct)}>
      <div className={cx(styles.fill, styles[tone], color && styles.custom)} style={{ width: `${pct}%` }}>
        <span className={styles.sheen} />
      </div>
    </div>
  );
}

interface RingProgressProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  tone?: 'brand' | 'success' | 'gold' | 'cyan';
  children?: ReactNode;
  trackOpacity?: number;
}

const GRADIENTS: Record<string, [string, string]> = {
  brand: ['#7c6cff', '#d96cff'],
  success: ['#2dd4bf', '#34d399'],
  gold: ['#ffd87a', '#ffae3b'],
  cyan: ['#36d6e7', '#5b8cff'],
};

export function RingProgress({
  value,
  size = 120,
  stroke = 10,
  tone = 'brand',
  children,
  trackOpacity = 0.08,
}: RingProgressProps) {
  const gid = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(value, 0, 1);
  const [from, to] = GRADIENTS[tone];

  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fff" strokeOpacity={trackOpacity} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.ringValue}
        />
      </svg>
      {children && <div className={styles.ringCenter}>{children}</div>}
    </div>
  );
}
