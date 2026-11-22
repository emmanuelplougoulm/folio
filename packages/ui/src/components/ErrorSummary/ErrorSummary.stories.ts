import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FErrorSummary from './ErrorSummary.vue';
import FFormField from '../FormField/FormField.vue';
import FTextInput from '../TextInput/TextInput.vue';

const meta = {
  title: 'Formulaires/ErrorSummary',
  component: FErrorSummary,
  args: {
    title: 'Le formulaire contient 2 erreurs',
    autoFocus: false,
    errors: [
      { id: 'story-email', message: 'Saisissez votre adresse e-mail.' },
      { id: 'story-name', message: 'Saisissez votre nom.' }
    ]
  },
  render: (args) => ({
    components: { FErrorSummary, FFormField, FTextInput },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: var(--f-space-6); max-inline-size: 28rem;">
        <FErrorSummary v-bind="args" />
        <FFormField id="story-email" label="Adresse e-mail" required error="Saisissez votre adresse e-mail.">
          <FTextInput type="email" />
        </FFormField>
        <FFormField id="story-name" label="Nom" required error="Saisissez votre nom.">
          <FTextInput autocomplete="name" />
        </FFormField>
      </div>`
  })
} satisfies Meta<typeof FErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvecChamps: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Saisissez votre nom.' }));
    await expect(canvas.getByLabelText('Nom')).toHaveFocus();
  }
};
