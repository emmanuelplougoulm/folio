import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FVisuallyHidden from './VisuallyHidden.vue';

describe('FVisuallyHidden', () => {
  it('rend son contenu dans un span par défaut', () => {
    render(FVisuallyHidden, { slots: { default: 'Fermer' } });
    const el = screen.getByText('Fermer');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('f-visually-hidden');
  });

  it('respecte la prop as', () => {
    render(FVisuallyHidden, { props: { as: 'legend' }, slots: { default: 'Adresse' } });
    expect(screen.getByText('Adresse').tagName).toBe('LEGEND');
  });
});
