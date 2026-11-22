import { defineConfig, defaultClientConditions } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Dans le workspace, l'app consomme les sources de Folio (rechargement à chaud, pas de build préalable).
    conditions: ['folio-source', ...defaultClientConditions]
  },
  server: { port: 5173, strictPort: true }
});
