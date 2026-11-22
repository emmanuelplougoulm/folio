import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FRadioGroup from './RadioGroup.vue';

const offers = [
  { value: 'essential', label: 'Essentiel', description: 'Une livraison par mois' },
  { value: 'plus', label: 'Plus', description: 'Deux livraisons par mois' },
  { value: 'pro', label: 'Pro', description: 'Livraisons illimitées' }
];
const prices: Record<string, string> = {
  essential: '9,90 €',
  plus: '19,90 €',
  pro: '39,90 €'
};

const meta = {
  title: 'Formulaires/RadioGroup',
  component: FRadioGroup,
  args: {
    legend: 'Choisissez une offre',
    options: offers,
    variant: 'default',
    required: true
  },
  render: (args) => ({
    components: { FRadioGroup },
    setup: () => ({ args, value: ref<string>(), prices }),
    template: `
      <div style="max-inline-size: 28rem;">
        <FRadioGroup v-bind="args" v-model="value">
          <template #option="{ option }">
            <span style="font-variant-numeric: tabular-nums; font-weight: 500;">{{ prices[option.value] }}</span>
          </template>
        </FRadioGroup>
      </div>`
  })
} satisfies Meta<typeof FRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText('Plus'));
    await expect(canvas.getByLabelText('Plus')).toBeChecked();
  }
};

/**
 * Toute la carte est cliquable : le libellé est étiré sur la carte. user-event clique sur
 * l'élément ciblé sans test de recouvrement, c'est donc l'e2e Playwright du banc d'essai
 * qui vérifie le clic sur la description.
 */
export const Cartes: Story = {
  args: { variant: 'card' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText('Pro'));
    await expect(canvas.getByLabelText('Pro')).toBeChecked();
  }
};

export const Erreur: Story = {
  args: { variant: 'card', error: 'Choisissez une offre pour continuer.' }
};
