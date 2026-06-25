import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './Field.module.css';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, optional, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {optional && <span className={styles.optional}>Optional</span>}
        </label>
      )}
      {children}
      {error ? <p className={styles.error}>{error}</p> : hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & { invalid?: boolean; prefix?: ReactNode };

export const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput(
  { invalid, prefix, className, ...rest },
  ref,
) {
  if (prefix) {
    return (
      <div className={cx(styles.control, styles.withPrefix, invalid && styles.invalid)}>
        <span className={styles.prefix}>{prefix}</span>
        <input ref={ref} className={cx(styles.input, styles.bare, className)} {...rest} />
      </div>
    );
  }
  return <input ref={ref} className={cx(styles.control, styles.input, invalid && styles.invalid, className)} {...rest} />;
});

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea(
  { invalid, className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cx(styles.control, styles.textarea, invalid && styles.invalid, className)} {...rest} />;
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref,
) {
  return (
    <div className={styles.selectWrap}>
      <select ref={ref} className={cx(styles.control, styles.select, invalid && styles.invalid, className)} {...rest}>
        {children}
      </select>
      <ChevronDown className={styles.selectChevron} aria-hidden />
    </div>
  );
});
