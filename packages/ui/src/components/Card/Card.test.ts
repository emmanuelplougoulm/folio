import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FCard from './Card.vue';

describe('FCard', () => {
  it('section nommée par son titre, au niveau demandé', () => {
    render(FCard, {
      props: { title: 'Livraison', headingLevel: 3 },
      slots: { default: 'À domicile' }
    });
    expect(screen.getByRole('region', { name: 'Livraison' })).toHaveTextContent(
      'À domicile'
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Livraison' })
    ).toBeInTheDocument();
  });

  it('sans titre, pas de nom ni de header', () => {
    render(FCard, { props: { as: 'div' }, slots: { default: 'Contenu' } });
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Contenu').closest('.f-card')).not.toHaveAttribute(
      'aria-labelledby'
    );
  });

  it('rend les slots headerAction et footer', () => {
    render(FCard, {
      props: { title: 'Offre' },
      slots: { headerAction: '<a href="#offre">Modifier</a>', footer: 'Total' }
    });
    expect(screen.getByRole('link', { name: 'Modifier' })).toBeInTheDocument();
    expect(screen.getByText('Total').tagName).toBe('FOOTER');
  });
});
