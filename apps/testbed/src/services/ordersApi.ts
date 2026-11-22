import type { StoredOrder } from '../order/history';

/**
 * Chargement simulé de l'historique (latence), pour montrer l'état de chargement.
 * `fail` simule une panne du service (paramètre ?simulate=orders-error de la page compte).
 */
export async function fetchOrders(
  source: readonly StoredOrder[],
  { fail = false }: { fail?: boolean } = {}
): Promise<StoredOrder[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (fail) throw new Error('orders-unavailable');
  return [...source];
}
