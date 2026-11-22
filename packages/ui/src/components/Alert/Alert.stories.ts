import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FAlert from './Alert.vue';
import FButton from '../Button/Button.vue';

const meta = {
  title: 'Retours/Alert',
  component: FAlert,
  args: { tone: 'info', title: 'Paiement fictif', live: 'off' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    live: { control: 'inline-radio', options: ['off', 'polite', 'assertive'] }
  },
  render: (args) => ({
    components: { FAlert },
    setup: () => ({ args }),
    template:
      '<FAlert v-bind="args">Aucune carte réelle n’est débitée sur ce banc d’essai.</FAlert>'
  })
} satisfies Meta<typeof FAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Succes: Story = { args: { tone: 'success', title: 'Commande confirmée' } };
export const Avertissement: Story = { args: { tone: 'warning', title: 'Stock limité' } };

export const Erreur: Story = {
  args: { tone: 'danger', title: 'Connexion impossible', live: 'assertive' },
  render: (args) => ({
    components: { FAlert, FButton },
    setup: () => ({ args }),
    template: `
      <FAlert v-bind="args">
        E-mail ou mot de passe incorrect.
        <template #actions><FButton size="sm">Réinitialiser le mot de passe</FButton></template>
      </FAlert>`
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Connexion impossible');
  }
};

export const TousLesTons: Story = {
  render: () => ({
    components: { FAlert },
    template: `
      <div style="display: grid; gap: var(--f-space-4); max-inline-size: 36rem;">
        <FAlert tone="info" title="Info">Texte d’information.</FAlert>
        <FAlert tone="success" title="Succès">Texte de confirmation.</FAlert>
        <FAlert tone="warning" title="Avertissement">Texte d’avertissement.</FAlert>
        <FAlert tone="danger" title="Erreur">Texte d’erreur.</FAlert>
      </div>`
  })
};
