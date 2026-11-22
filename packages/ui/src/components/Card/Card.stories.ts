import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FCard from './Card.vue';

const meta = {
  title: 'Structure/Card',
  component: FCard,
  args: { title: 'Livraison', headingLevel: 2, as: 'section' },
  render: (args) => ({
    components: { FCard },
    setup: () => ({ args }),
    template: `
      <div style="max-inline-size: 28rem;">
        <FCard v-bind="args">
          <p style="margin: 0;">À domicile · 12 rue des Lilas, 75011 Paris</p>
          <template #headerAction><a href="#livraison">Modifier</a></template>
          <template #footer>Livraison estimée sous 3 jours ouvrés</template>
        </FCard>
      </div>`
  })
} satisfies Meta<typeof FCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recapitulatif: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Livraison' })).toBeVisible();
  }
};
