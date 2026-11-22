export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export type CardField = keyof CardInput;

export const digitsOf = (value: string): string => value.replace(/\D/g, '');

/** « 4242424242424242 » → « 4242 4242 4242 4242 ». */
export const formatCardNumber = (value: string): string =>
  digitsOf(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** « 0428 » ou « 04/28 » → « 04/28 ». */
export function formatExpiry(value: string): string {
  const digits = digitsOf(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Algorithme de Luhn : détecte les fautes de frappe dans un numéro de carte. */
export function passesLuhn(number: string): boolean {
  const digits = digitsOf(number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** Erreurs par champ (clés i18n), dans l'ordre du formulaire. */
export function validateCard(
  card: CardInput,
  now: Date = new Date()
): Partial<Record<CardField, string>> {
  const errors: Partial<Record<CardField, string>> = {};
  const number = digitsOf(card.number);
  if (!number) errors.number = 'payment.errors.number.required';
  else if (number.length < 13 || number.length > 19 || !passesLuhn(number)) {
    errors.number = 'payment.errors.number.invalid';
  }

  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim());
  if (!card.expiry.trim()) errors.expiry = 'payment.errors.expiry.required';
  else if (!match) errors.expiry = 'payment.errors.expiry.format';
  else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) errors.expiry = 'payment.errors.expiry.format';
    else if (year * 12 + month < now.getFullYear() * 12 + now.getMonth() + 1) {
      errors.expiry = 'payment.errors.expiry.past';
    }
  }

  if (!card.cvc.trim()) errors.cvc = 'payment.errors.cvc.required';
  else if (!/^\d{3,4}$/.test(card.cvc.trim())) errors.cvc = 'payment.errors.cvc.format';

  if (!card.name.trim()) errors.name = 'payment.errors.name';
  return errors;
}
