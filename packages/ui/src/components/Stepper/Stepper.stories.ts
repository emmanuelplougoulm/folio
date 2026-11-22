import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import FStepper from './Stepper.vue';

const meta = {
  title: 'Navigation/Stepper',
  component: FStepper,
  args: {
    label: 'Étapes de la commande',
    current: 1,
    steps: [
      { id: 'offer', label: 'Offre' },
      { id: 'delivery', label: 'Livraison' },
      { id: 'review', label: 'Récapitulatif' }
    ],
    statusLabels: { complete: 'Terminée', current: 'En cours', upcoming: 'À venir' }
  }
} satisfies Meta<typeof FStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EtapeDeux: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('listitem', { current: 'step' })).toHaveTextContent(
      'Livraison'
    );
  }
};

export const Debut: Story = { args: { current: 0 } };
export const Fin: Story = { args: { current: 2 } };

export const Espagnol: Story = {
  args: {
    label: 'Pasos del pedido',
    steps: [
      { id: 'offer', label: 'Oferta' },
      { id: 'delivery', label: 'Entrega a domicilio o en punto de recogida' },
      { id: 'review', label: 'Resumen' }
    ],
    statusLabels: { complete: 'Completado', current: 'En curso', upcoming: 'Pendiente' }
  }
};
