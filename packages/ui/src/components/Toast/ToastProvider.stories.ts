import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h } from 'vue';
import { expect, screen, waitFor } from 'storybook/test';
import FToastProvider from './ToastProvider.vue';
import FButton from '../Button/Button.vue';
import { useToast, type ToastTone } from './context';

const Demo = defineComponent({
  setup() {
    const toast = useToast();
    const tones: ToastTone[] = ['info', 'success', 'warning', 'danger'];
    const titles: Record<ToastTone, string> = {
      info: 'Nouvelle version disponible',
      success: 'Vous êtes connecté',
      warning: 'Session bientôt expirée',
      danger: 'Connexion perdue'
    };
    return () =>
      h(
        'div',
        { style: 'display: flex; flex-wrap: wrap; gap: var(--f-space-3);' },
        tones.map((tone) =>
          h(
            FButton,
            { onClick: () => toast.show({ title: titles[tone], tone }) },
            () => `Notifier : ${tone}`
          )
        )
      );
  }
});

const meta = {
  title: 'Retours/Toast',
  component: FToastProvider,
  args: {
    label: 'Notification',
    regionLabel: 'Notifications ({hotkey})',
    closeLabel: 'Fermer'
  },
  render: (args) => ({
    components: { FToastProvider, Demo },
    setup: () => ({ args }),
    template: '<FToastProvider v-bind="args"><Demo /></FToastProvider>'
  })
} satisfies Meta<typeof FToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tons: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Notifier : success' }));
    const title = await screen.findByText('Vous êtes connecté', {
      selector: '.f-toast__title'
    });
    // Attendre la fin de l'animation d'entrée (opacité de départ à 0).
    await waitFor(() => expect(title).toBeVisible());
  }
};
