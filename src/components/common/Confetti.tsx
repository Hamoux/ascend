import { useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import styles from './Confetti.module.css';

const COLORS = ['#7c6cff', '#d96cff', '#34d399', '#ffcf6b', '#56b6ff', '#fb7185'];

interface ConfettiProps {
  fireKey: number;
  count?: number;
}

export function Confetti({ fireKey, count = 20 }: ConfettiProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const dist = 55 + Math.random() * 80;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        size: 5 + Math.random() * 6,
      };
    });
  }, [fireKey, count]);

  if (!fireKey) return null;

  return (
    <div className={styles.wrap} aria-hidden>
      {particles.map((p, i) => (
        <motion.span
          key={`${fireKey}-${i}`}
          className={styles.piece}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.3, rotate: p.rotate }}
          transition={{ duration: 0.7 + Math.random() * 0.4, ease: 'easeOut' }}
          style={{ background: p.color, width: p.size, height: p.size } as CSSProperties}
        />
      ))}
    </div>
  );
}
