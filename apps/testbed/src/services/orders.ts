import type { OrderDraft } from '../order/draft';

export type PlaceOrderResult =
  { ok: true; number: string } | { ok: false; reason: 'pickup-point-unavailable' };

/** API de commande fictive : aucune requête réseau. */
export async function placeOrder(order: OrderDraft): Promise<PlaceOrderResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (order.method === 'relay' && order.pickupPoint === 'closed') {
    return { ok: false, reason: 'pickup-point-unavailable' };
  }
  const number = `FO-${String(Math.floor(100000 + Math.random() * 900000))}`;
  return { ok: true, number };
}
