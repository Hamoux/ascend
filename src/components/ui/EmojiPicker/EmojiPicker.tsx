import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';
import { EMOJI_PALETTE } from '@/lib/constants';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)} aria-label="Pick an icon">
        <span className={styles.current}>{value || '✨'}</span>
      </button>
      {open && (
        <div className={styles.popover} role="listbox">
          <div className={styles.grid}>
            {EMOJI_PALETTE.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={cx(styles.option, emoji === value && styles.selected)}
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            className={styles.custom}
            placeholder="Or paste any emoji…"
            maxLength={4}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v) onChange(v);
            }}
          />
        </div>
      )}
    </div>
  );
}
