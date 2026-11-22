import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src'],
      exclude: ['src/**/*.stories.ts', 'src/**/*.test.ts'],
      // Un seul index.d.ts : résolu par tous les modes de TypeScript (bundler, node16).
      bundleTypes: true
    })
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'folio'
    },
    rollupOptions: {
      external: ['vue', /^reka-ui/],
      output: { preserveModules: false }
    },
    sourcemap: true
  }
});
