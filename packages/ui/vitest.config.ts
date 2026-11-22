import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import viteConfig from './vite.config.ts';

const configDir = fileURLToPath(new URL('./.storybook', import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'happy-dom',
            include: ['src/**/*.test.ts'],
            setupFiles: ['./vitest.setup.ts']
          }
        },
        {
          extends: true,
          plugins: [storybookTest({ configDir })],
          test: {
            name: 'stories',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }]
            }
          }
        }
      ]
    }
  })
);
