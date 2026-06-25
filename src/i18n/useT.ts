import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { LOCALES, translate, type Language, type TKey, type TParams } from '@/i18n';
import { formatNumber } from '@/lib/format';
import { addDays, parseISO, toISODate, todayISO } from '@/lib/date';

export type UnitBase = 'unit.habit' | 'unit.reward' | 'unit.completion' | 'unit.skip' | 'unit.day' | 'unit.log';

export interface Translator {
  /** Translate a key with optional `{param}` interpolation. */
  t: (key: TKey, params?: TParams) => string;
  /** Pluralized count, e.g. tn(2, 'unit.habit') -> "2 habits". */
  tn: (n: number, base: UnitBase, params?: TParams) => string;
  lang: Language;
  locale: string;
  /** Localized helpers for dates. */
  fmtDate: (iso: string, opts?: { year?: boolean }) => string;
  fmtFullDate: (iso: string) => string;
  fmtTime: (ts: number) => string;
  fmtRelative: (ts: number, now?: number) => string;
  dayLabel: (iso: string) => string;
  monthName: (month: number) => string;
  weekdaysShort: () => string[];
}

export function useT(): Translator {
  const lang = useStore((s) => s.language);
  return useMemo(() => {
    const locale = LOCALES[lang];
    const t = (key: TKey, params?: TParams) => translate(lang, key, params);
    const tn = (n: number, base: UnitBase, params?: TParams) => {
      const form = lang === 'fr' ? (n > 1 ? 'other' : 'one') : n === 1 ? 'one' : 'other';
      return translate(lang, `${base}.${form}` as TKey, { n: formatNumber(n), ...params });
    };

    const fmtDate = (iso: string, opts?: { year?: boolean }) =>
      parseISO(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', ...(opts?.year ? { year: 'numeric' } : {}) });
    const fmtFullDate = (iso: string) =>
      parseISO(iso).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
    const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
    const fmtRelative = (ts: number, now = Date.now()) => {
      const mins = Math.floor(Math.max(0, now - ts) / 60_000);
      if (mins < 1) return t('common.just_now');
      if (mins < 60) return t('common.min_ago', { n: mins });
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return t('common.hour_ago', { n: hrs });
      const days = Math.floor(hrs / 24);
      if (days < 7) return t('common.day_ago', { n: days });
      return fmtDate(toISODate(new Date(ts)));
    };
    const dayLabel = (iso: string) =>
      iso === todayISO() ? t('common.today') : iso === toISODate(addDays(new Date(), -1)) ? t('common.yesterday') : fmtDate(iso);
    const monthName = (month: number) => new Date(2024, month, 1).toLocaleDateString(locale, { month: 'long' });
    const weekdaysShort = () => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }));

    return { t, tn, lang, locale, fmtDate, fmtFullDate, fmtTime, fmtRelative, dayLabel, monthName, weekdaysShort };
  }, [lang]);
}
