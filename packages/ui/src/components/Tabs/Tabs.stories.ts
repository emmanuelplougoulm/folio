import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FTabs from './Tabs.vue';

const meta = {
  title: 'Navigation/Tabs',
  component: FTabs,
  args: {
    label: 'Sections du compte',
    modelValue: 'orders',
    tabs: [
      { value: 'orders', label: 'Commandes' },
      { value: 'profile', label: 'Profil' },
      { value: 'preferences', label: 'Préférences' }
    ]
  },
  render: (args) => ({
    components: { FTabs },
    setup: () => ({ args, active: ref('orders') }),
    template: `
      <FTabs :tabs="args.tabs" :label="args.label" v-model="active">
        <template #orders><p>Vos commandes récentes.</p></template>
        <template #profile><p>Votre nom et votre adresse e-mail.</p></template>
        <template #preferences><p>Vos préférences de notification.</p></template>
      </FTabs>`
  })
} satisfies Meta<typeof FTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compte: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Commandes' }));
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Préférences' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  }
};
