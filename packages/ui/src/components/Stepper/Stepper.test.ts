import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import FStepper from './Stepper.vue';

const steps = [
  { id: 'offer', label: 'Offre' },
  { id: 'delivery', label: 'Livraison' },
  { id: 'review', label: 'Récapitulatif' }
];
const statusLabels = { complete: 'terminée', current: 'en cours', upcoming: 'à venir' };

describe('FStepper', () => {
  it('liste ordonnée dans une nav, étape courante marquée et statuts textuels', () => {
    render(FStepper, { props: { steps, current: 1, label: 'Étapes', statusLabels } });
    const nav = screen.getByRole('navigation', { name: 'Étapes' });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Offreterminée');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).toHaveTextContent('Livraisonen cours');
    expect(items[2]).toHaveTextContent('Récapitulatifà venir');
  });

  it('slot step : lien vers une étape terminée', () => {
    render(FStepper, {
      props: { steps, current: 2, label: 'Étapes', statusLabels },
      slots: {
        step: `<template #step="{ step, status }">
          <a v-if="status === 'complete'" :href="'#' + step.id">{{ step.label }}</a>
          <span v-else>{{ step.label }}</span>
        </template>`
      }
    });
    expect(screen.getByRole('link', { name: 'Offre' })).toHaveAttribute('href', '#offer');
    expect(screen.queryByRole('link', { name: 'Récapitulatif' })).toBeNull();
  });
});
