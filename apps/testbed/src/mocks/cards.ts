/**
 * Cartes de test du banc d'essai, sur le modèle des cartes de test des prestataires de paiement.
 * Aucun prestataire n'est appelé : l'API de paiement est simulée (services/payments.ts).
 */
export const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  challenge: '4000 0000 0000 3220',
  declined: '4000 0000 0000 0002',
  insufficientFunds: '4000 0000 0000 9995'
} as const;

/** Code de validation 3-D Secure attendu par la simulation. */
export const CHALLENGE_CODE = '123456';
