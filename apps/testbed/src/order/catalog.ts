/** Catalogue fictif du banc d'essai. Les montants sont en centimes d'euro. */
export const OFFERS = [
  { id: 'essential', price: 990 },
  { id: 'plus', price: 1990 },
  { id: 'pro', price: 3990 }
] as const;
export type OfferId = (typeof OFFERS)[number]['id'];

export const DELIVERY_METHODS = [
  { id: 'home', fee: 490 },
  { id: 'relay', fee: 0 }
] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]['id'];

export const COUNTRIES = ['FR', 'BE', 'ES'] as const;
export type Country = (typeof COUNTRIES)[number];

/** Codes postaux : 5 chiffres en France et en Espagne, 4 en Belgique. */
export const POSTAL_CODE: Record<Country, RegExp> = {
  FR: /^\d{5}$/,
  BE: /^\d{4}$/,
  ES: /^\d{5}$/
};

/** Points relais fictifs. « closed » est refusé à la confirmation (branche d'erreur serveur). */
export const PICKUP_POINTS = [
  { id: 'lyon-2', label: 'Librairie du Rhône, 12 quai Saint-Antoine, 69002 Lyon' },
  { id: 'bruxelles-1', label: 'Épicerie Sablon, 4 rue de Rollebeek, 1000 Bruxelles' },
  { id: 'closed', label: 'Kiosque de la gare, 1 place de la Gare, 59000 Lille' }
] as const;
export type PickupPointId = (typeof PICKUP_POINTS)[number]['id'];

export const offerPrice = (id: OfferId): number =>
  OFFERS.find((o) => o.id === id)?.price ?? 0;
export const deliveryFee = (id: DeliveryMethod): number =>
  DELIVERY_METHODS.find((m) => m.id === id)?.fee ?? 0;
