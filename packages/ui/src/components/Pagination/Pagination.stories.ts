import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FPagination from './Pagination.vue';

const meta = {
  title: 'Navigation/Pagination',
  component: FPagination,
  args: {
    pageCount: 12,
    label: 'Pagination des commandes',
    previousLabel: 'Précédente',
    nextLabel: 'Suivante',
    pageLabel: (n: number) => `Page ${String(n)}`
  },
  render: (args) => ({
    components: { FPagination },
    setup: () => ({ args, page: ref(6) }),
    template: '<FPagination v-bind="args" v-model:page="page" />'
  })
} satisfies Meta<typeof FPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LongueSerie: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Suivante' }));
    await expect(canvas.getByRole('button', { name: 'Page 7' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  }
};

export const CourteSerie: Story = { args: { pageCount: 3 } };
