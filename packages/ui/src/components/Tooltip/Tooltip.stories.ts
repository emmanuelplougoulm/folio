import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, screen, waitFor } from 'storybook/test';
import FTooltip from './Tooltip.vue';

const meta = {
  title: 'Retours/Tooltip',
  component: FTooltip,
  args: {
    content: 'Paiement simulé : aucune donnée ne quitte le navigateur.',
    side: 'top'
  },
  render: (args) => ({
    components: { FTooltip },
    setup: () => ({ args }),
    template: `
      <div style="padding: 4rem;">
        <FTooltip v-bind="args"><button type="button">Sécurité du paiement</button></FTooltip>
      </div>`
  })
} satisfies Meta<typeof FTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Sécurité du paiement' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Paiement simulé');
    await waitFor(() =>
      expect(trigger).toHaveAccessibleDescription(
        'Paiement simulé : aucune donnée ne quitte le navigateur.'
      )
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  }
};
