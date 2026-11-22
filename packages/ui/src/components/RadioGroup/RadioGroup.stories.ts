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

// Les types de Storybook ne savent pas typer un composant Vue « generic » (vue-tsc et
// typescript-eslint divergent sur le cast) : le composant n'est pas déclaré dans la meta,
// et les props sont vérifiées par vue-tsc dans le template de rendu.
const meta: Meta = {
  title: 'Formulaires/RadioGroup',
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
};

export default meta;
type Story = StoryObj;

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
