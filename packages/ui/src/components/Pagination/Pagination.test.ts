import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FPagination from './Pagination.vue';

const setup = (initial: number, pageCount: number) => {
  const page = ref(initial);
  render({
    components: { FPagination },
    setup: () => ({ page, pageCount, pageLabel: (n: number) => `Page ${String(n)}` }),
    template: `<FPagination v-model:page="page" :page-count="pageCount" label="Pagination"
      previous-label="Précédente" next-label="Suivante" :page-label="pageLabel" />`
  });
  return page;
};

const visiblePages = () =>
  within(screen.getByRole('navigation', { name: 'Pagination' }))
    .getAllByRole('button')
    .map((b) => b.textContent.trim());

describe('FPagination', () => {
  it('page courante marquée, précédente désactivée sur la première page', () => {
    setup(1, 3);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: 'Précédente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Suivante' })).toBeEnabled();
  });

  it('navigue au clic et via suivante', async () => {
    const page = setup(1, 3);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(page.value).toBe(3);
    expect(screen.getByRole('button', { name: 'Suivante' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Précédente' }));
    expect(page.value).toBe(2);
  });

  it('condense les longues séries : 1 … 5 6 7 … 12', () => {
    setup(6, 12);
    expect(visiblePages()).toEqual(['Précédente', '1', '5', '6', '7', '12', 'Suivante']);
    expect(
      document.querySelectorAll('.f-pagination__gap[aria-hidden="true"]')
    ).toHaveLength(2);
  });

  it('rien à paginer : pas de navigation', () => {
    setup(1, 1);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
