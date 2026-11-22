import type { Preview } from '@storybook/vue3-vite';

const preview: Preview = {
  parameters: {
    // Toute violation axe fait échouer le test de la story.
    a11y: { test: 'error' },
    controls: { expanded: true }
  },
  tags: ['autodocs']
};

export default preview;
