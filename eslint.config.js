import pluginVue from 'eslint-plugin-vue';
import vueA11y from 'eslint-plugin-vuejs-accessibility';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default defineConfigWithVueTs(
  {
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/*.generated.*'
    ]
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  ...vueA11y.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser }
    },
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': [
        'error',
        {
          order: [
            'defineOptions',
            'defineProps',
            'defineEmits',
            'defineModel',
            'defineSlots'
          ]
        }
      ],
      'vue/require-v-for-key': 'error',
      'vue/no-unused-properties': 'error',
      'vue/no-bare-strings-in-template': 'error',
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  },
  {
    files: ['**/*.config.{js,ts}', '**/.storybook/**'],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    files: ['**/*.stories.ts', '**/*.test.ts'],
    rules: { 'vue/no-bare-strings-in-template': 'off' }
  },
  prettier
);
