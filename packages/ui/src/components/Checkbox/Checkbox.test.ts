import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FCheckbox from './Checkbox.vue';

describe('FCheckbox', () => {
  it('case native en v-model, cliquable par son libellé', async () => {
    const accepted = ref(false);
    render({
      components: { FCheckbox },
      setup: () => ({ accepted }),
      template:
        '<FCheckbox v-model="accepted" label="J’accepte les conditions" name="terms" />'
    });
    const box = screen.getByRole('checkbox', { name: 'J’accepte les conditions' });
    expect(box).toHaveAttribute('name', 'terms');
    await userEvent.click(screen.getByText('J’accepte les conditions'));
    expect(accepted.value).toBe(true);
    await userEvent.keyboard(' ');
    expect(accepted.value).toBe(false);
  });

  it('description et erreur reliées, état invalide', () => {
    render(FCheckbox, {
      props: {
        label: 'J’accepte les conditions',
        description: 'Conditions générales de vente.',
        error: 'Acceptez les conditions pour continuer.',
        required: true
      }
    });
    const box = screen.getByRole('checkbox');
    expect(box).toBeRequired();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(
      'Conditions générales de vente. Acceptez les conditions pour continuer.'
    );
  });
});
