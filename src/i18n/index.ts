import { en, type TKey } from './en';
import { fr } from './fr';

export type Language = 'en' | 'fr';
export type { TKey };

export const translations: Record<Language, Record<TKey, string>> = { en, fr };
export const LOCALES: Record<Language, string> = { en: 'en-US', fr: 'fr-FR' };
export const LANGUAGE_LABELS: Record<Language, string> = { en: 'English', fr: 'Français' };

export type TParams = Record<string, string | number>;

export function interpolate(str: string, params?: TParams): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (params[key] != null ? String(params[key]) : `{${key}}`));
}

/** Framework-agnostic translate — usable outside React (e.g. the store). */
export function translate(lang: Language, key: TKey, params?: TParams): string {
  return interpolate(translations[lang][key] ?? translations.en[key] ?? key, params);
}
