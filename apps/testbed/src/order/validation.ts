import { POSTAL_CODE } from './catalog';
import type { OrderDraft } from './draft';
import { stepsOf } from './process';
import type { OrderStep } from './steps';
import { validateEmail } from '../forms/validators';

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

export type ContactField = 'email' | 'phone';

/** Facultatif ; s'il est saisi : chiffres, espaces, points ou tirets, + initial, 9 à 15 chiffres. */
const PHONE = /^\+?[\d\s.-]+$/;

export function validateContact(d: OrderDraft): FieldErrors<ContactField> {
  const errors: FieldErrors<ContactField> = {};
  const email = validateEmail(d.email);
  if (email) errors.email = email;
  const phone = d.phone.trim();
  const digits = phone.replace(/\D/g, '').length;
  if (phone && (!PHONE.test(phone) || digits < 9 || digits > 15)) {
    errors.phone = 'order.errors.phone';
  }
  return errors;
}

export const isEmpty = (errors: object): boolean => Object.keys(errors).length === 0;

const complete: Record<OrderStep, (d: OrderDraft) => boolean> = {
  offer: (d) => isEmpty(validateOffer(d)),
  delivery: (d) => isEmpty(validateDelivery(d)),
  contact: (d) => isEmpty(validateContact(d)),
  review: (d) => d.acceptedTerms && d.reservation !== null,
  payment: () => false
};

/** Première étape incomplète dans la version du brouillon : on ne peut pas aller au-delà. */
export function firstIncompleteStep(d: OrderDraft): OrderStep {
  const steps = stepsOf(d.processVersion);
  return steps.find((step) => !complete[step](d)) ?? 'payment';
}
