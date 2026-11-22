export const ORDER_STEPS = ['offer', 'delivery', 'review', 'payment'] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];
