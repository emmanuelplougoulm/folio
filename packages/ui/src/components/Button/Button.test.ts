import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FButton from './Button.vue';

describe('FButton', () => {
  it('rend un bouton natif de type button par défaut', () => {
    render(FButton, { slots: { default: 'Continuer' } });
    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('f-button--secondary', 'f-button--md');
  });

  it('émet click', async () => {
    const view = render(FButton, { slots: { default: 'Continuer' } });
    await userEvent.click(screen.getByRole('button'));
    expect(view.emitted('click')).toHaveLength(1);
  });

  it('pendant le chargement : reste focusable, annonce le libellé et bloque les clics', async () => {
    const view = render(FButton, {
      props: { type: 'submit', loading: true, loadingLabel: 'Connexion en cours' },
      slots: { default: 'Se connecter' }
    });
    const button = screen.getByRole('button', { name: /Se connecter/ });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Connexion en cours');
    await userEvent.click(button);
    expect(view.emitted('click')).toBeUndefined();
  });

  it('désactivé : attribut disabled natif', () => {
    render(FButton, { props: { disabled: true }, slots: { default: 'Payer' } });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('rendu comme lien : pas de type, href transmis, aria-disabled si désactivé', () => {
    render(FButton, {
      props: { as: 'a', disabled: true },
      attrs: { href: '/connexion' },
      slots: { default: 'Se connecter' }
    });
    const link = screen.getByRole('link', { name: 'Se connecter' });
    expect(link).toHaveAttribute('href', '/connexion');
    expect(link).not.toHaveAttribute('type');
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });
});
