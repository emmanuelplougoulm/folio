import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect } from 'storybook/test';
import FTextArea from './TextArea.vue';
import FFormField from '../FormField/FormField.vue';

const meta = {
  title: 'Formulaires/TextArea',
  component: FTextArea,
  args: {
    maxlength: 200,
    counter: (length: number, max: number) =>
      `${String(length)} / ${String(max)} caractères`
  },
  render: (args) => ({
    components: { FTextArea, FFormField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div style="max-inline-size: 28rem;">
        <FFormField label="Instructions de livraison" hint="Digicode, étage, horaires…">
          <FTextArea v-bind="args" v-model="value" />
        </FFormField>
      </div>`
  })
} satisfies Meta<typeof FTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvecCompteur: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox'), 'Code 1234B');
    await expect(canvas.getByText('10 / 200 caractères')).toBeVisible();
  }
};
