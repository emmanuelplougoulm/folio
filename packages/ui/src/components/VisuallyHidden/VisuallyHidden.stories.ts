import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FVisuallyHidden from './VisuallyHidden.vue';

const meta = {
  title: 'Utilitaires/VisuallyHidden',
  component: FVisuallyHidden,
  args: { as: 'span' }
} satisfies Meta<typeof FVisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Donne un nom accessible à un bouton dont le libellé visible est une icône. */
export const NomAccessible: Story = {
  render: (args) => ({
    components: { FVisuallyHidden },
    setup: () => ({ args }),
    template: `<button type="button">✕ <FVisuallyHidden v-bind="args">Fermer la fenêtre</FVisuallyHidden></button>`
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Fermer la fenêtre/ })).toBeVisible();
  }
};
