import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FEmptyState from './EmptyState.vue';
import FButton from '../Button/Button.vue';

const meta = {
  title: 'Retours/EmptyState',
  component: FEmptyState,
  args: {
    title: 'Passez votre première commande',
    description: 'Vos commandes et leur suivi apparaîtront ici.',
    headingLevel: 2
  },
  render: (args) => ({
    components: { FEmptyState, FButton },
    setup: () => ({ args }),
    template: `
      <FEmptyState v-bind="args">
        <template #illustration>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16l-1.5 12h-13L4 7Zm4 0a4 4 0 0 1 8 0" /></svg>
        </template>
        <template #actions><FButton variant="primary">Commencer une commande</FButton></template>
      </FEmptyState>`
  })
} satisfies Meta<typeof FEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Commandes: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Passez votre première commande' })
    ).toBeVisible();
  }
};
