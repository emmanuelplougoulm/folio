import type { StoredOrder } from '../order/history';
import { ACCOUNTS } from './accounts';

/** Commandes passées du compte de démonstration, pour montrer chaque statut. */
export const SEEDED_ORDERS: readonly StoredOrder[] = [
  {
    number: 'FO-482913',
    email: ACCOUNTS.demo.email,
    placedAt: '2026-10-03T09:12:00.000Z',
    offer: 'plus',
    total: 2480,
    status: 'delivered'
  },
  {
    number: 'FO-317204',
    email: ACCOUNTS.demo.email,
    placedAt: '2026-09-14T17:40:00.000Z',
    offer: 'essential',
    total: 990,
    status: 'cancelled'
  }
];
