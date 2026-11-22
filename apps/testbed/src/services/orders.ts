import type { OrderDraft } from '../order/draft';

export type ReserveResult =
  { ok: true; reservation: string } | { ok: false; reason: 'pickup-point-unavailable' };

/** Réservation simulée de la commande, avant le paiement : aucune requête réseau. */
export async function reserveOrder(order: OrderDraft): Promise<ReserveResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (order.method === 'relay' && order.pickupPoint === 'closed') {
    return { ok: false, reason: 'pickup-point-unavailable' };
  }
  return { ok: true, reservation: `R-${String(Date.now())}` };
}
