import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FDescriptionList from './DescriptionList.vue';

const items = [
  { term: 'Offre', details: 'Plus' },
  { term: 'Total', details: '24,80 €' }
];

describe('FDescriptionList', () => {
  it('rend une liste de définitions dt/dd', () => {
    render(FDescriptionList, { props: { items } });
    const terms = screen.getAllByRole('term');
    const definitions = screen.getAllByRole('definition');
    expect(terms.map((t) => t.textContent)).toEqual(['Offre', 'Total']);
    expect(definitions[1]).toHaveTextContent('24,80 €');
  });

  it('slot details pour une valeur riche', () => {
    render(FDescriptionList, {
      props: { items },
      slots: {
        details:
          '<template #details="{ item }"><strong>{{ item.details }}</strong></template>'
      }
    });
    expect(screen.getByText('Plus').tagName).toBe('STRONG');
  });
});
