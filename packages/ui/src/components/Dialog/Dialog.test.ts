import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FDialog from './Dialog.vue';

const setup = (dismissible = true) => {
  const open = ref(false);
  const dismissed = ref(0);
  render({
    components: { FDialog },
    setup: () => ({ open, dismissed, dismissible }),
    template: `
      <button type="button" @click="open = true">Payer</button>
      <FDialog
        v-model:open="open"
        title="Confirmez le paiement"
        description="Saisissez le code reçu par SMS."
        close-label="Fermer"
        :dismissible="dismissible"
        @dismiss="dismissed++"
      >
        <label for="code">Code</label><input id="code" />
        <template #footer><button type="button" @click="open = false">Annuler</button></template>
      </FDialog>`
  });
  return { open, dismissed };
};

describe('FDialog', () => {
  it('dialogue modal nommé et décrit, focus à l’intérieur', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Payer' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirmez le paiement' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Saisissez le code reçu par SMS.');
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it('Échap ferme, émet dismiss et rend le focus au déclencheur', async () => {
    const { open, dismissed } = setup();
    const trigger = screen.getByRole('button', { name: 'Payer' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(open.value).toBe(false);
    expect(dismissed.value).toBe(1);
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('non dismissible : ni Échap ni bouton ×', async () => {
    const { open } = setup(false);
    open.value = true;
    await nextTick();
    await screen.findByRole('dialog');
    expect(screen.queryByRole('button', { name: 'Fermer' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
