import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { expect, screen, waitFor } from 'storybook/test';
import FCombobox from './Combobox.vue';
import FFormField from '../FormField/FormField.vue';

const points = [
  {
    value: 'lyon-2',
    label: 'Librairie du Rhône',
    description: '12 quai Saint-Antoine, 69002 Lyon'
  },
  {
    value: 'bruxelles-1',
    label: 'Épicerie Sablon',
    description: '4 rue de Rollebeek, 1000 Bruxelles'
  },
  {
    value: 'sevilla-1',
    label: 'Quiosco Triana',
    description: 'Calle Betis 20, 41010 Sevilla'
  }
];

const meta = {
  title: 'Formulaires/Combobox',
  component: FCombobox,
  args: {
    options: points,
    emptyLabel: 'Aucun point relais trouvé',
    toggleLabel: 'Afficher les points relais',
    placeholder: 'Ville, code postal ou nom'
  },
  render: (args) => ({
    components: { FCombobox, FFormField },
    setup: () => ({ args, value: ref<string>() }),
    template: `
      <div style="max-inline-size: 28rem; min-block-size: 18rem;">
        <FFormField label="Point relais" hint="Tapez pour filtrer la liste." required>
          <FCombobox v-bind="args" v-model="value" />
        </FFormField>
        <p data-testid="value">{{ value }}</p>
      </div>`
  })
} satisfies Meta<typeof FCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recherche: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Point relais' });
    await expect(input).toHaveAccessibleDescription('Tapez pour filtrer la liste.');
    await userEvent.type(input, 'epicerie');
    const option = await screen.findByRole('option', { name: /Épicerie Sablon/ });
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await userEvent.click(option);
    await expect(canvas.getByTestId('value')).toHaveTextContent('bruxelles-1');
    await expect(input).toHaveValue('Épicerie Sablon');
  }
};

export const AucunResultat: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'zzz');
    await expect(await screen.findByText('Aucun point relais trouvé')).toBeVisible();
  }
};
