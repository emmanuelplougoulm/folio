import { describe, expect, it } from 'vitest';
import { ORDER_STEPS } from './steps';
import {
  PROCESS,
  PROCESS_VERSIONS,
  deliveryFeeFor,
  orderTotal,
  stepAfter,
  stepBefore,
  stepsOf
} from './process';

describe('versions du processus de commande', () => {
  it('chaque version commence par l’offre, finit par le paiement, sans étape inconnue', () => {
    for (const version of PROCESS_VERSIONS) {
      const steps = stepsOf(version);
      expect(steps[0]).toBe('offer');
      expect(steps.at(-1)).toBe('payment');
      expect(steps.every((step) => ORDER_STEPS.includes(step))).toBe(true);
    }
  });

  it('chaque changement renvoie à un ticket unique', () => {
    const tickets = PROCESS_VERSIONS.flatMap((v) => PROCESS[v].changes).map(
      (c) => c.ticket
    );
    expect(tickets.every((ticket) => /^FOL-\d+$/.test(ticket))).toBe(true);
    expect(new Set(tickets).size).toBe(tickets.length);
  });

  it('les versions sont publiées dans l’ordre', () => {
    const dates = PROCESS_VERSIONS.map((v) => PROCESS[v].releasedOn);
    expect([...dates].sort()).toEqual(dates);
  });

  it('étapes voisines selon la version', () => {
    expect(stepAfter('v1', 'delivery')).toBe('review');
    expect(stepAfter('v2', 'delivery')).toBe('contact');
    expect(stepBefore('v2', 'review')).toBe('contact');
    expect(stepBefore('v1', 'review')).toBe('delivery');
    expect(stepBefore('v1', 'offer')).toBeUndefined();
    expect(stepAfter('v2', 'payment')).toBeUndefined();
  });

  it.each([
    ['v1', 'home', 'pro', 490],
    ['v2', 'home', 'pro', 0],
    ['v2', 'home', 'plus', 490],
    ['v2', 'home', undefined, 490],
    ['v1', 'relay', 'pro', 0],
    ['v2', 'relay', 'essential', 0]
  ] as const)(
    '%s, livraison %s, offre %s : %i centimes',
    (version, method, offer, fee) => {
      expect(deliveryFeeFor(version, method, offer)).toBe(fee);
    }
  );

  it('total : offre et livraison', () => {
    expect(orderTotal({ processVersion: 'v1', offer: 'pro', method: 'home' })).toBe(4480);
    expect(orderTotal({ processVersion: 'v2', offer: 'pro', method: 'home' })).toBe(3990);
    expect(
      orderTotal({ processVersion: 'v2', offer: undefined, method: undefined })
    ).toBe(0);
  });
});
