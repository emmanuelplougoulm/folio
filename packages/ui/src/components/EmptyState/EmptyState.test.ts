import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FEmptyState from './EmptyState.vue';

describe('FEmptyState', () => {
  it('titre au niveau demandé, description et actions', () => {
    render(FEmptyState, {
      props: {
        title: 'Passez votre première commande',
        description: 'Vos commandes apparaîtront ici.',
        headingLevel: 3
      },
      slots: {
        actions: '<a href="/order">Commencer une commande</a>',
        illustration: '<svg></svg>'
      }
    });
    expect(
      screen.getByRole('heading', { level: 3, name: 'Passez votre première commande' })
    ).toBeInTheDocument();
    expect(screen.getByText('Vos commandes apparaîtront ici.')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Commencer une commande' })
    ).toBeInTheDocument();
    expect(document.querySelector('.f-empty-state__illustration')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});
