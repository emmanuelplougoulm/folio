import { describe, expect, it } from 'vitest';
import type { OrderDraft } from './draft';
import {
  firstIncompleteStep,
  validateContact,
  validateDelivery,
  validateOffer
} from './validation';

const base: OrderDraft = {
  processVersion: 'v1',
  offer: undefined,
  method: undefined,
  fullName: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  pickupPoint: '',
  instructions: '',
  email: '',
  phone: '',
  acceptedTerms: false,
  reservation: null
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

  it('première étape incomplète, v1', () => {
    expect(firstIncompleteStep(base)).toBe('offer');
    expect(firstIncompleteStep({ ...base, offer: 'pro' })).toBe('delivery');
    expect(firstIncompleteStep(home)).toBe('review');
    expect(firstIncompleteStep({ ...home, acceptedTerms: true })).toBe('review');
    expect(
      firstIncompleteStep({ ...home, acceptedTerms: true, reservation: 'R-1' })
    ).toBe('payment');
  });

  it('première étape incomplète, v2 : les coordonnées avant le récapitulatif', () => {
    const v2 = { ...home, processVersion: 'v2' as const };
    expect(firstIncompleteStep(v2)).toBe('contact');
    expect(firstIncompleteStep({ ...v2, email: 'ana@exemple.fr' })).toBe('review');
    expect(
      firstIncompleteStep({
        ...v2,
        email: 'ana@exemple.fr',
        acceptedTerms: true,
        reservation: 'R-1'
      })
    ).toBe('payment');
  });

  it('coordonnées : e-mail requis, téléphone facultatif mais valide', () => {
    expect(validateContact(base)).toEqual({ email: 'validation.email.required' });
    const ok = { ...base, email: 'ana@exemple.fr' };
    expect(validateContact(ok)).toEqual({});
    expect(validateContact({ ...ok, email: 'ana@' })).toEqual({
      email: 'validation.email.format'
    });
  });

  it.each([
    ['06 12 34 56 78', undefined],
    ['+33 6 12 34 56 78', undefined],
    ['+34 612.34.56.78', undefined],
    ['0612', 'order.errors.phone'],
    ['06 12 34 56 7a', 'order.errors.phone'],
    ['+33 6 12 34 56 78 90 12 34', 'order.errors.phone']
  ] as const)('téléphone « %s »', (phone, expected) => {
    expect(validateContact({ ...base, email: 'ana@exemple.fr', phone }).phone).toBe(
      expected
    );
  });
});
