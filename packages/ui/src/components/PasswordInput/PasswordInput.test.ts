import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FFormField from '../FormField/FormField.vue';
import FPasswordInput from './PasswordInput.vue';

describe('FPasswordInput', () => {
  const setup = () =>
    render({
      components: { FFormField, FPasswordInput },
      template: `
        <FFormField label="Mot de passe" required error="Saisissez votre mot de passe.">
          <FPasswordInput show-label="Afficher" hide-label="Masquer" autocomplete="current-password" />
        </FFormField>`
    });

  it('hérite du contexte du champ et transmet les attributs à l’input', () => {
    setup();
    const input = screen.getByLabelText('Mot de passe');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('affiche puis masque le mot de passe', async () => {
    setup();
    const input = screen.getByLabelText('Mot de passe');
    const toggle = screen.getByRole('button', { name: 'Afficher' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-controls', input.id);

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Masquer' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
