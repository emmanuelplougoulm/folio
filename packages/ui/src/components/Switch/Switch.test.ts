import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FSwitch from './Switch.vue';

describe('FSwitch', () => {
  it('interrupteur natif nommé et décrit, en v-model au clic et à l’Espace', async () => {
    const enabled = ref(false);
    render({
      components: { FSwitch },
      setup: () => ({ enabled }),
      template: `<FSwitch v-model="enabled" label="E-mails de suivi" description="Un e-mail à chaque étape de livraison." name="tracking" />`
    });
    const toggle = screen.getByRole('switch', { name: 'E-mails de suivi' });
    expect(toggle).toHaveAccessibleDescription('Un e-mail à chaque étape de livraison.');
    expect(toggle).toHaveAttribute('name', 'tracking');
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(enabled.value).toBe(true);
    await userEvent.keyboard(' ');
    expect(enabled.value).toBe(false);
  });
});
