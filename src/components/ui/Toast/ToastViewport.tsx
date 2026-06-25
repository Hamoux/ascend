import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Coins, Info, X, XCircle } from 'lucide-react';
import type { Toast, ToastVariant } from '@/types';
import { useStore } from '@/store/useStore';
import { signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './Toast.module.css';

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
  points: Coins,
};

const DURATION = 3800;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const positive = (toast.points ?? 0) >= 0;

  return (
    <motion.div
      layout
      className={cx(styles.toast, styles[toast.variant])}
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <span className={styles.icon}>
        <Icon />
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      {toast.points !== undefined && (
        <span className={cx(styles.points, positive ? styles.gain : styles.loss)}>{signed(toast.points)}</span>
      )}
      <button className={styles.dismiss} aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>
        <X />
      </button>
      <motion.span
        className={styles.progress}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return createPortal(
    <div className={styles.viewport}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
