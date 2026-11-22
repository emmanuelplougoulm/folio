import { defineConfig } from 'vitest/config';

// Les tests tournent dans l'environnement serveur de Vite, qui a ses propres conditions.
// Folio y est traité par Vite (noExternal) et non par Node : la condition folio-source
// s'applique, et les tests lisent les sources même sans build (en CI, avant le build).
export default defineConfig({
  ssr: {
    noExternal: ['@emmanuelplougoulm/folio'],
    // Conditions serveur par défaut de Vite, précédées de folio-source.
    resolve: { conditions: ['folio-source', 'module', 'node', 'development|production'] }
  },
  test: { include: ['src/**/*.test.ts'] }
});
