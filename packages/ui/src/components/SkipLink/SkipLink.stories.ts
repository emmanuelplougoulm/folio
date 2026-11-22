import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import FSkipLink from './SkipLink.vue';

const meta = {
  title: 'Navigation/SkipLink',
  component: FSkipLink,
  args: { href: '#contenu' }
} satisfies Meta<typeof FSkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Invisible jusqu'au premier Tab, puis visible au-dessus de tout. */
export const AuClavier: Story = {
  render: (args) => ({
    components: { FSkipLink },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; min-block-size: 8rem;">
        <FSkipLink v-bind="args">Aller au contenu</FSkipLink>
        <main id="contenu" tabindex="-1"><p>Contenu principal</p></main>
      </div>`
  }),
  play: async ({ canvas }) => {
    await userEvent.tab();
    const link = canvas.getByRole('link', { name: 'Aller au contenu' });
    await expect(link).toHaveFocus();
    await expect(link).toBeVisible();
  }
};
