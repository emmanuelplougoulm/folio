import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FLanguageSwitcher from './LanguageSwitcher.vue';

const meta = {
  title: 'Navigation/LanguageSwitcher',
  component: FLanguageSwitcher,
  args: {
    label: 'Langue',
    current: 'fr',
    languages: [
      { code: 'fr', label: 'Français', link: { href: '#fr' } },
      { code: 'en', label: 'English', link: { href: '#en' } },
      { code: 'es', label: 'Español', link: { href: '#es' } }
    ]
  }
} satisfies Meta<typeof FLanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TroisLangues: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Español' })).toHaveAttribute(
      'lang',
      'es'
    );
  }
};
