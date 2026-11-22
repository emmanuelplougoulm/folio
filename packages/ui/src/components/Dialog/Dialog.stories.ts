import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, screen, waitFor } from 'storybook/test';
import FDialog from './Dialog.vue';
import FButton from '../Button/Button.vue';
import FFormField from '../FormField/FormField.vue';
import FTextInput from '../TextInput/TextInput.vue';

const meta = {
  title: 'Retours/Dialog',
  component: FDialog,
  args: {
    title: 'Confirmez le paiement',
    description: 'Saisissez le code à 6 chiffres reçu par SMS.',
    closeLabel: 'Fermer',
    dismissible: true
  },
  render: (args) => ({
    components: { FDialog, FButton, FFormField, FTextInput },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <FButton variant="primary" @click="open = true">Payer 24,80 €</FButton>
      <FDialog v-bind="args" v-model:open="open">
        <FFormField label="Code de vérification">
          <FTextInput inputmode="numeric" autocomplete="one-time-code" />
        </FFormField>
        <template #footer>
          <FButton @click="open = false">Annuler</FButton>
          <FButton variant="primary" @click="open = false">Valider</FButton>
        </template>
      </FDialog>`
  })
} satisfies Meta<typeof FDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verification: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Payer 24,80 €' });
    await userEvent.click(trigger);
    // Le dialogue est téléporté hors du canvas : on le cherche dans tout le document.
    const dialog = await screen.findByRole('dialog', { name: 'Confirmez le paiement' });
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  }
};
