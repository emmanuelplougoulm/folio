import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FSwitch from './Switch.vue';

const meta = {
  title: 'Formulaires/Switch',
  component: FSwitch,
  args: {
    label: 'E-mails de suivi',
    description: 'Un e-mail à chaque étape de la livraison.'
  },
  render: (args) => ({
    components: { FSwitch },
    setup: () => ({ args, value: ref(true) }),
    template:
      '<div style="max-inline-size: 28rem;"><FSwitch v-bind="args" v-model="value" /></div>'
  })
} satisfies Meta<typeof FSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'E-mails de suivi' });
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  }
};

export const Desactive: Story = { args: { disabled: true } };
