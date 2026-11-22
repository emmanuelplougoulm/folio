import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FBadge from './Badge.vue';

const meta = {
  title: 'Retours/Badge',
  component: FBadge,
  args: { tone: 'neutral', size: 'md' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'danger']
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] }
  },
  render: (args) => ({
    components: { FBadge },
    setup: () => ({ args }),
    template: '<FBadge v-bind="args">En préparation</FBadge>'
  })
} satisfies Meta<typeof FBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutre: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('En préparation')).toBeVisible();
  }
};

export const StatutsDeCommande: Story = {
  render: () => ({
    components: { FBadge },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--f-space-3);">
        <FBadge tone="info">Confirmée</FBadge>
        <FBadge tone="warning">En préparation</FBadge>
        <FBadge tone="success">Livrée</FBadge>
        <FBadge tone="danger">Annulée</FBadge>
        <FBadge>Brouillon</FBadge>
        <FBadge tone="success" size="sm">Petit</FBadge>
      </div>`
  })
};
