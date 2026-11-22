import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FSkipLink from './SkipLink.vue';

describe('FSkipLink', () => {
  it('pointe vers #main par défaut', () => {
    render(FSkipLink, { slots: { default: 'Aller au contenu' } });
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute(
      'href',
      '#main'
    );
  });

  it('accepte une autre cible', () => {
    render(FSkipLink, {
      props: { href: '#form' },
      slots: { default: 'Aller au formulaire' }
    });
    expect(screen.getByRole('link')).toHaveAttribute('href', '#form');
  });
});
