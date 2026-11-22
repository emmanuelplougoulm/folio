import type { Preview } from '@storybook/vue3-vite';
import '../src/styles/fonts.css';
import '../src/styles/index.css';
import '../src/styles/base.css';

type Theme = 'light' | 'dark' | 'system';

const preview: Preview = {
  parameters: {
    // Toute violation axe fait échouer le test de la story.
    a11y: { test: 'error' },
    controls: { expanded: true },
    backgrounds: { disable: true }
  },
  globalTypes: {
    theme: {
      description: 'Thème Folio',
      toolbar: {
        title: 'Thème',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Clair' },
          { value: 'dark', title: 'Sombre' },
          { value: 'system', title: 'Système' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      const theme = (context.globals['theme'] ?? 'light') as Theme;
      const root = document.documentElement;
      if (theme === 'system') delete root.dataset['theme'];
      else root.dataset['theme'] = theme;
      return story();
    }
  ],
  tags: ['autodocs']
};

export default preview;
