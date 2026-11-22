import { computed, ref, watch, type ComputedRef } from 'vue';
import type { OfferId } from './catalog';
import type { ProcessVersion } from './process';
import { SEEDED_ORDERS } from '../mocks/orders';

export type OrderStatus = 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface StoredOrder {
  number: string;
  /** Compte connecté au moment de la commande, ou null pour une commande invité. */
  email: string | null;
  placedAt: string;
  offer: OfferId;
  /** Montant en centimes. */
  total: number;
  status: OrderStatus;
  /** Version du processus suivie (absente des commandes passées avant les versions). */
  processVersion?: ProcessVersion;
}

const STORAGE_KEY = 'folio-testbed:orders';

function restore(): StoredOrder[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

const placed = ref<StoredOrder[]>(restore());

watch(
  placed,
  (value) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Stockage indisponible : l'historique reste en mémoire.
    }
  },
  { deep: true }
);

export function addOrder(order: StoredOrder) {
  placed.value.unshift(order);
}

/** Commandes d'un compte, de la plus récente à la plus ancienne. */
export function useOrdersOf(email: () => string | undefined): ComputedRef<StoredOrder[]> {
  return computed(() => {
    const owner = email();
    if (!owner) return [];
    return [...placed.value, ...SEEDED_ORDERS]
      .filter((order) => order.email === owner)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  });
}
