import { describe, expect, it } from 'vitest';
import { formatCardNumber, formatExpiry, passesLuhn, validateCard } from './card';
import { TEST_CARDS } from '../mocks/cards';

const NOW = new Date(2026, 10, 22); // 22 novembre 2026
const valid = {
  number: TEST_CARDS.success,
  expiry: '12/28',
  cvc: '123',
  name: 'Ana Demo'
};

describe('carte de paiement', () => {
  it('formate le numéro et la date', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('4242-4242 42')).toBe('4242 4242 42');
    expect(formatExpiry('0428')).toBe('04/28');
    expect(formatExpiry('4')).toBe('4');
  });

  it('Luhn : les cartes de test passent, une faute de frappe échoue', () => {
    for (const card of Object.values(TEST_CARDS)) expect(passesLuhn(card)).toBe(true);
    expect(passesLuhn('4242 4242 4242 4241')).toBe(false);
  });

  it('carte valide : aucune erreur', () => {
    expect(validateCard(valid, NOW)).toEqual({});
  });

  it.each([
    [{ number: '' }, 'number', 'payment.errors.number.required'],
    [{ number: '4242 4242 4242 4241' }, 'number', 'payment.errors.number.invalid'],
    [{ expiry: '' }, 'expiry', 'payment.errors.expiry.required'],
    [{ expiry: '13/28' }, 'expiry', 'payment.errors.expiry.format'],
    [{ expiry: '1028' }, 'expiry', 'payment.errors.expiry.format'],
    [{ expiry: '10/26' }, 'expiry', 'payment.errors.expiry.past'],
    [{ expiry: '11/26' }, 'expiry', undefined],
    [{ cvc: '12' }, 'cvc', 'payment.errors.cvc.format'],
    [{ cvc: '1234' }, 'cvc', undefined],
    [{ name: ' ' }, 'name', 'payment.errors.name']
  ] as const)('%o → %s : %s', (patch, field, expected) => {
    expect(validateCard({ ...valid, ...patch }, NOW)[field]).toBe(expected);
  });
});
