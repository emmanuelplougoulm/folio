import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FBreadcrumb from './Breadcrumb.vue';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: FBreadcrumb,
  args: {
    label: "Fil d'Ariane",
    items: [
      { label: 'Accueil', link: { href: '#accueil' } },
      { label: 'Mon compte', link: { href: '#compte' } },
      { label: 'Préférences' }
    ]
  }
} satisfies Meta<typeof FBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compte: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Préférences')).toHaveAttribute('aria-current', 'page');
  }
};
