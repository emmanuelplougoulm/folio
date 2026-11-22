import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FToastProvider from './ToastProvider.vue';
import { useToast, type ToastOptions } from './context';

const Trigger = defineComponent({
  props: { options: { type: Object as () => ToastOptions, required: true } },
  setup(props) {
    const toast = useToast();
    return () =>
      h(
        'button',
        { type: 'button', onClick: () => toast.show(props.options) },
        'Notifier'
      );
  }
});

const setup = (options: ToastOptions) =>
  render({
    components: { FToastProvider, Trigger },
    setup: () => ({ options }),
    template: `
      <FToastProvider label="Notification" region-label="Notifications ({hotkey})" close-label="Fermer">
        <Trigger :options="options" />
      </FToastProvider>`
  });

describe('FToastProvider + useToast', () => {
  it('affiche la notification dans une région nommée, fermable', async () => {
    setup({
      title: 'Vous êtes connecté',
      description: 'Bienvenue, Ana.',
      tone: 'success'
    });
    await userEvent.click(screen.getByRole('button', { name: 'Notifier' }));
    expect(await screen.findByText('Vous êtes connecté')).toBeInTheDocument();
    expect(screen.getByText('Bienvenue, Ana.')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Notifications (F8)' })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    await waitFor(() => {
      expect(screen.queryByText('Vous êtes connecté')).toBeNull();
    });
  });

  it('useToast sans provider lève une erreur explicite', () => {
    expect(() => render(Trigger, { props: { options: { title: 'x' } } })).toThrow(
      /FToastProvider/
    );
  });
});
