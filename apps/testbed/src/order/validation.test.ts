import { describe, expect, it } from 'vitest';
import type { OrderDraft } from './draft';
import { firstIncompleteStep, validateDelivery, validateOffer } from './validation';

const base: OrderDraft = {
  offer: undefined,
  method: undefined,
  fullName: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  pickupPoint: '',
  instructions: ''
};

const home: OrderDraft = {
  ...base,
  offer: 'plus',
  method: 'home',
  fullName: 'Ana Demo',
  address: '12 rue des Lilas',
  postalCode: '75011',
  city: 'Paris',
  country: 'FR'
};

describe('validation de la commande', () => {
  it('offre requise', () => {
    expect(validateOffer(base)).toEqual({ offer: 'order.errors.offer' });
    expect(validateOffer({ ...base, offer: 'pro' })).toEqual({});
  });

  it('mode de livraison requis avant tout le reste', () => {
    expect(validateDelivery(base)).toEqual({ method: 'order.errors.method' });
  });

  it('point relais : seul le point est exigé', () => {
    expect(validateDelivery({ ...base, method: 'relay' })).toEqual({
      pickupPoint: 'order.errors.pickupPoint'
    });
    expect(validateDelivery({ ...base, method: 'relay', pickupPoint: 'lyon-2' })).toEqual(
      {}
    );
  });

  it('domicile : tous les champs d’adresse', () => {
    expect(Object.keys(validateDelivery({ ...base, method: 'home' }))).toEqual([
      'fullName',
      'address',
      'postalCode',
      'city',
      'country'
    ]);
    expect(validateDelivery(home)).toEqual({});
  });

  it.each([
    ['FR', '7501', 'order.errors.postalCode.FR'],
    ['BE', '10000', 'order.errors.postalCode.BE'],
    ['BE', '1000', undefined],
    ['ES', '28013', undefined]
  ] as const)('code postal %s « %s »', (country, postalCode, expected) => {
    expect(validateDelivery({ ...home, country, postalCode }).postalCode).toBe(expected);
  });

  it('première étape incomplète', () => {
    expect(firstIncompleteStep(base)).toBe(0);
    expect(firstIncompleteStep({ ...base, offer: 'pro' })).toBe(1);
    expect(firstIncompleteStep(home)).toBe(2);
  });
});
