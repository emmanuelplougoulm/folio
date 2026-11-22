import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FDescriptionList from './DescriptionList.vue';

const meta = {
  title: 'Structure/DescriptionList',
  component: FDescriptionList,
  args: {
    layout: 'inline',
    items: [
      { term: 'Offre Plus', details: '19,90 €' },
      { term: 'Livraison à domicile', details: '4,90 €' },
      { term: 'Total du premier mois', details: '24,80 €' }
    ]
  },
  render: (args) => ({
    components: { FDescriptionList },
    setup: () => ({ args }),
    template:
      '<div style="max-inline-size: 24rem;"><FDescriptionList v-bind="args" /></div>'
  })
} satisfies Meta<typeof FDescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Montants: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('term')).toHaveLength(3);
  }
};

export const Empilee: Story = {
  args: {
    layout: 'stacked',
    items: [
      { term: 'Adresse de livraison', details: '12 rue des Lilas, 75011 Paris, France' },
      { term: 'Instructions', details: 'Code 1234B, 3e étage' }
    ]
  }
};
