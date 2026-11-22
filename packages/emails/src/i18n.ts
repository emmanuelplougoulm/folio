import { en } from './locales/en';
import { es } from './locales/es';
import { fr, type EmailMessages } from './locales/fr';

export type EmailLocale = 'fr' | 'en' | 'es';

export const MESSAGES: Record<EmailLocale, EmailMessages> = { fr, en, es };

const TAGS: Record<EmailLocale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

/** Remplace les {variables} ; lève une erreur si une variable manque (pas de « {name} » envoyé). */
export function interpolate(
  template: string,
  values: Record<string, string> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value === undefined)
      throw new Error(`Variable manquante dans un e-mail : {${key}}`);
    return value;
  });
}

export const formatPrice = (cents: number, locale: EmailLocale): string =>
  new Intl.NumberFormat(TAGS[locale], { style: 'currency', currency: 'EUR' }).format(
    cents / 100
  );

export const formatDateTime = (iso: string, locale: EmailLocale): string =>
  new Intl.DateTimeFormat(TAGS[locale], {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Paris'
  }).format(new Date(iso));

export const formatDate = (iso: string, locale: EmailLocale): string =>
  new Intl.DateTimeFormat(TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'Europe/Paris'
  }).format(new Date(iso));

/** Deux-points typographique : espace insécable avant en français, aucune espace sinon. */
export const colon = (locale: EmailLocale): string =>
  locale === 'fr' ? '\u00a0: ' : ': ';
