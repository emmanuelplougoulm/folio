import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FSkeleton from './Skeleton.vue';

const meta = {
  title: 'Retours/Skeleton',
  component: FSkeleton,
  args: { lines: 3, width: '24rem', height: '1em', shape: 'text' },
  render: (args) => ({
    components: { FSkeleton },
    setup: () => ({ args }),
    template: `
      <div aria-busy="true" role="status">
        <span style="position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%);">Chargement des commandes</span>
        <FSkeleton v-bind="args" />
      </div>`
  })
} satisfies Meta<typeof FSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paragraphe: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Chargement des commandes'
    );
  }
};

export const Bloc: Story = { args: { lines: 1, shape: 'block', height: '8rem' } };
