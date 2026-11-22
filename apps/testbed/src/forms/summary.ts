import type { ErrorSummaryItem } from '@emmanuelplougoulm/folio';

/**
 * Construit les entrées du récapitulatif d'erreurs dans l'ordre des champs.
 * `targets` permet de viser un autre id que celui du champ (premier radio d'un groupe).
 */
export function toSummary<K extends string>(
  order: readonly K[],
  errors: Partial<Record<K, string>>,
  t: (key: string) => string,
  targets: Partial<Record<K, string>> = {}
): ErrorSummaryItem[] {
  return order.flatMap((field) => {
    const key = errors[field];
    return key ? [{ id: targets[field] ?? field, message: t(key) }] : [];
  });
}
