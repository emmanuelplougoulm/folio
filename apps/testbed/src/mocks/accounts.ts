/**
 * Comptes fictifs du banc d'essai : valeurs de test, sans rapport avec un vrai service.
 * Chaque compte déclenche une branche du parcours de connexion.
 */
export const DEMO_PASSWORD = 'Folio-demo-2026';

export const ACCOUNTS = {
  /** Connexion réussie. */
  demo: { email: 'demo@folio.test', name: 'Ana Demo', status: 'active' },
  /** Connexion réussie, aucune commande : état vide de l'historique. */
  newcomer: { email: 'new@folio.test', name: 'Nina Nouvelle', status: 'active' },
  /** Identifiants corrects, mais compte verrouillé. */
  locked: { email: 'locked@folio.test', name: 'Léo Locked', status: 'locked' }
} as const;
