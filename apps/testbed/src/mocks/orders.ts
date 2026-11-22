import type { OrderStatus, StoredOrder } from '../order/history';
import type { OfferId } from '../order/catalog';
import { ACCOUNTS } from './accounts';

const OFFERS: OfferId[] = ['plus', 'essential', 'pro'];
const STATUSES: OrderStatus[] = ['delivered', 'cancelled', 'delivered', 'preparing'];
const TOTALS: Record<OfferId, number> = { essential: 990, plus: 2480, pro: 3990 };

/**
 * 12 commandes passées du compte de démonstration (assez pour paginer), une par mois
 * en remontant depuis octobre 2026. La plus récente porte le numéro FO-482913.
 */
export const SEEDED_ORDERS: readonly StoredOrder[] = Array.from(
  { length: 12 },
  (_, index) => {
    const offer = OFFERS[index % OFFERS.length] ?? 'plus';
    const date = new Date(Date.UTC(2026, 9 - index, 3, 9, 12));
    return {
      number: `FO-${String(482913 - index * 1371)}`,
      email: ACCOUNTS.demo.email,
      placedAt: date.toISOString(),
      offer,
      total: TOTALS[offer],
      status:
        index === 0 ? 'delivered' : (STATUSES[index % STATUSES.length] ?? 'delivered')
    };
  }
);
