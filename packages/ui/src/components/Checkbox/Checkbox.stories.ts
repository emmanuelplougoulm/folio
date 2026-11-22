import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FCheckbox from './Checkbox.vue';

const meta = {
  title: 'Formulaires/Checkbox',
  component: FCheckbox,
  args: { label: 'J’accepte les conditions générales de vente', required: true }
} satisfies Meta<typeof FCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('checkbox');
    await userEvent.click(box);
    await expect(box).toBeChecked();
  }
};

export const AvecDescription: Story = {
  args: { description: 'Vous pouvez les consulter avant de confirmer.' }
};

export const Erreur: Story = {
  args: { error: 'Acceptez les conditions générales de vente pour continuer.' }
};

export const Desactive: Story = { args: { disabled: true } };
