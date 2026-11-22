import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['folio-source'] },
  test: { include: ['src/**/*.test.ts'] }
});
