import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent } from 'storybook/test';
import FButton from './Button.vue';

const meta = {
  title: 'Actions/Button',
  component: FButton,
  args: { variant: 'secondary', size: 'md', onClick: fn() },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger']
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
  },
  render: (args) => ({
    components: { FButton },
    setup: () => ({ args }),
    template: '<FButton v-bind="args">Continuer</FButton>'
  })
} satisfies Meta<typeof FButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondaire: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continuer' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  }
};

export const Primaire: Story = { args: { variant: 'primary' } };
export const Fantome: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger' } };

export const Tailles: Story = {
  render: (args) => ({
    components: { FButton },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: var(--f-space-4); align-items: center;">
        <FButton v-bind="args" size="sm">Petit</FButton>
        <FButton v-bind="args" size="md">Moyen</FButton>
        <FButton v-bind="args" size="lg">Grand</FButton>
      </div>`
  })
};

export const Chargement: Story = {
  args: { variant: 'primary', loading: true, loadingLabel: 'Connexion en cours' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: /Continuer/ });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  }
};

export const Desactive: Story = { args: { disabled: true } };

/** Libellé espagnol long : le bouton s'élargit, sans troncature. */
export const LibelleLong: Story = {
  args: { variant: 'primary' },
  render: (args) => ({
    components: { FButton },
    setup: () => ({ args }),
    template: '<FButton v-bind="args">Continuar con el pago seguro</FButton>'
  })
};

export const PleineLargeur: Story = { args: { variant: 'primary', block: true } };

export const CommeLien: Story = {
  render: (args) => ({
    components: { FButton },
    setup: () => ({ args }),
    template:
      '<FButton v-bind="args" as="a" href="#connexion" variant="primary">Se connecter</FButton>'
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Se connecter' })).toHaveAttribute(
      'href',
      '#connexion'
    );
  }
};
