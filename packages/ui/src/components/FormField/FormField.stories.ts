import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FFormField from './FormField.vue';
import FTextInput from '../TextInput/TextInput.vue';
import FPasswordInput from '../PasswordInput/PasswordInput.vue';

const meta = {
  title: 'Formulaires/FormField',
  component: FFormField,
  args: {
    label: 'Adresse e-mail',
    hint: '',
    error: '',
    required: false,
    disabled: false
  },
  render: (args) => ({
    components: { FFormField, FTextInput },
    setup: () => ({ args }),
    template: `
      <div style="max-inline-size: 24rem;">
        <FFormField v-bind="args"><FTextInput type="email" autocomplete="email" /></FFormField>
      </div>`
  })
} satisfies Meta<typeof FFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Adresse e-mail')).toHaveAttribute(
      'type',
      'email'
    );
  }
};

export const AvecAide: Story = {
  args: { hint: 'Celle que vous avez utilisée à l’inscription.' }
};

export const Obligatoire: Story = { args: { required: true } };

export const Erreur: Story = {
  args: {
    required: true,
    hint: 'Celle que vous avez utilisée à l’inscription.',
    error: 'Saisissez une adresse e-mail au format nom@exemple.fr.'
  },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Adresse e-mail');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Celle que vous avez utilisée à l’inscription. Saisissez une adresse e-mail au format nom@exemple.fr.'
    );
  }
};

export const Desactive: Story = { args: { disabled: true } };

/** Libellé et erreur en espagnol, plus longs que le français. */
export const TexteLong: Story = {
  args: {
    label: 'Dirección de correo electrónico profesional',
    error:
      'Introduce una dirección de correo electrónico con el formato nombre@ejemplo.es.'
  }
};

export const MotDePasse: Story = {
  args: { label: 'Mot de passe', required: true },
  render: (args) => ({
    components: { FFormField, FPasswordInput },
    setup: () => ({ args }),
    template: `
      <div style="max-inline-size: 24rem;">
        <FFormField v-bind="args">
          <FPasswordInput show-label="Afficher" hide-label="Masquer" autocomplete="current-password" />
        </FFormField>
      </div>`
  }),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Mot de passe');
    await userEvent.type(input, 'secret');
    await userEvent.click(canvas.getByRole('button', { name: 'Afficher' }));
    await expect(input).toHaveAttribute('type', 'text');
  }
};
