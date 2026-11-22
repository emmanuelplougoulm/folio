import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FAlert from './Alert.vue';

describe('FAlert', () => {
  it('statique par défaut : aucun rôle live', () => {
    render(FAlert, { props: { title: 'Information' }, slots: { default: 'Texte' } });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Information')).toBeInTheDocument();
  });

  it('assertive : role=alert', () => {
    render(FAlert, {
      props: { tone: 'danger', live: 'assertive', title: 'Connexion impossible' },
      slots: { default: 'E-mail ou mot de passe incorrect.' }
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Connexion impossibleE-mail ou mot de passe incorrect.'
    );
  });

  it('polite : role=status', () => {
    render(FAlert, { props: { tone: 'success', live: 'polite', title: 'Enregistré' } });
    expect(screen.getByRole('status')).toHaveClass('f-alert--success');
  });
});
