import { defineConfig, defaultClientConditions } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // Chemin de publication : « / » en local et pour les tests e2e, « /folio/ » sur GitHub Pages (voir pages.yml).
  base: process.env['FOLIO_BASE'] ?? '/',
  plugins: [vue()],
  resolve: {
    // Dans le workspace, l'app consomme les sources de Folio (rechargement à chaud, pas de build préalable).
    conditions: ['folio-source', ...defaultClientConditions]
  },
  server: { port: 5173, strictPort: true }
});
