import { motion } from 'framer-motion';
import styles from './Splash.module.css';

export function Splash() {
  return (
    <motion.div className={styles.splash} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <motion.div
        className={styles.logo}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <svg viewBox="0 0 32 32" aria-hidden>
          <path d="M16 5 L26 25 H6 Z" fill="url(#splashGrad)" />
          <path d="M16 13 L21 23 H11 Z" fill="#08080f" />
          <defs>
            <linearGradient id="splashGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c6cff" />
              <stop offset="1" stopColor="#d96cff" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <motion.span
        className={styles.word}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        Ascend
      </motion.span>
      <div className={styles.bar}>
        <motion.span
          className={styles.barFill}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
