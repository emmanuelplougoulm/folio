/** Toutes les étapes connues du tunnel. Chaque version du processus en retient une partie. */
export const ORDER_STEPS = ['offer', 'delivery', 'contact', 'review', 'payment'] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];
