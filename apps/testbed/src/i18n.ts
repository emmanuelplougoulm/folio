import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const LOCALES = ['fr', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

/** Le français fait référence : les autres langues doivent avoir exactement les mêmes clés. */
export type MessageSchema = typeof fr;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/** Langue préférée du navigateur parmi celles proposées, sinon le français. */
export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export const i18n = createI18n<[MessageSchema], Locale, false>({
  // vue-i18n 11 démarre encore en mode legacy par défaut : on active l'API Composition.
  // L'option disparaîtra en v12, où ce mode deviendra le seul.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { fr, en, es }
});
