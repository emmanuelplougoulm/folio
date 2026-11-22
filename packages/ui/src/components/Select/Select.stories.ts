import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FSelect from './Select.vue';
import FFormField from '../FormField/FormField.vue';

const countries = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'ES', label: 'Espagne' }
];

const meta = {
  title: 'Formulaires/Select',
  component: FSelect,
  args: { options: countries, placeholder: 'Choisissez un pays' },
  render: (args) => ({
    components: { FSelect, FFormField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="max-inline-size: 20rem;">
        <FFormField label="Pays" required>
          <FSelect v-bind="args" v-model="value" />
        </FFormField>
      </div>`
  })
} satisfies Meta<typeof FSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pays: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Pays' });
    await userEvent.selectOptions(select, 'BE');
    await expect(select).toHaveValue('BE');
  }
};
