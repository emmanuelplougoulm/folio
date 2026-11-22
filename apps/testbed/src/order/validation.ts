import { POSTAL_CODE } from './catalog';
import type { OrderDraft } from './draft';

/** Erreurs par champ : clés i18n, dans l'ordre d'affichage du formulaire. */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type OfferField = 'offer';
export type DeliveryField =
  'method' | 'fullName' | 'address' | 'postalCode' | 'city' | 'country' | 'pickupPoint';

export function validateOffer(d: OrderDraft): FieldErrors<OfferField> {
  return d.offer ? {} : { offer: 'order.errors.offer' };
}

export function validateDelivery(d: OrderDraft): FieldErrors<DeliveryField> {
  if (!d.method) return { method: 'order.errors.method' };
  if (d.method === 'relay') {
    return d.pickupPoint ? {} : { pickupPoint: 'order.errors.pickupPoint' };
  }
  const errors: FieldErrors<DeliveryField> = {};
  if (!d.fullName.trim()) errors.fullName = 'order.errors.fullName';
  if (!d.address.trim()) errors.address = 'order.errors.address';
  if (!d.postalCode.trim()) errors.postalCode = 'order.errors.postalCode.required';
  else if (d.country && !POSTAL_CODE[d.country].test(d.postalCode.trim())) {
    errors.postalCode = `order.errors.postalCode.${d.country}`;
  }
  if (!d.city.trim()) errors.city = 'order.errors.city';
  if (!d.country) errors.country = 'order.errors.country';
  return errors;
}

export const isEmpty = (errors: object): boolean => Object.keys(errors).length === 0;

/** Index de la première étape incomplète (0 offre, 1 livraison, 2 récapitulatif). */
export function firstIncompleteStep(d: OrderDraft): number {
  if (!isEmpty(validateOffer(d))) return 0;
  if (!isEmpty(validateDelivery(d))) return 1;
  return 2;
}
