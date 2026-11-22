import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FTable from './Table.vue';
import FBadge from '../Badge/Badge.vue';

const meta = {
  title: 'Données/Table',
  component: FTable,
  args: {
    caption: 'Mes commandes',
    rowKey: 'number',
    columns: [
      { key: 'number', label: 'Commande', rowHeader: true },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Statut' },
      { key: 'total', label: 'Total', align: 'end' }
    ],
    rows: [
      { number: 'FO-482913', date: '3 octobre 2026', status: 'Livrée', total: '24,80 €' },
      {
        number: 'FO-317204',
        date: '14 septembre 2026',
        status: 'Annulée',
        total: '9,90 €'
      },
      { number: 'FO-209118', date: '2 août 2026', status: 'Livrée', total: '1 129,00 €' }
    ]
  },
  render: (args) => ({
    components: { FTable, FBadge },
    setup: () => ({ args }),
    template: `
      <FTable v-bind="args">
        <template #cell="{ column, value }">
          <FBadge v-if="column.key === 'status'" :tone="value === 'Livrée' ? 'success' : 'danger'" size="sm">{{ value }}</FBadge>
          <template v-else>{{ value }}</template>
        </template>
      </FTable>`
  })
} satisfies Meta<typeof FTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Commandes: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Mes commandes' })).toBeVisible();
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(3);
  }
};

export const LegendeMasquee: Story = { args: { hideCaption: true } };
