import type { Locale } from '../i18n';

const TAGS: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

/** 990 → « 9,90 € » (fr), « €9.90 » (en), « 9,90 € » (es). */
export const formatPrice = (cents: number, locale: Locale): string =>
  new Intl.NumberFormat(TAGS[locale], { style: 'currency', currency: 'EUR' }).format(
    cents / 100
  );
