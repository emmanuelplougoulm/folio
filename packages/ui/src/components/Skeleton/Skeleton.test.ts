import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/vue';
import FSkeleton from './Skeleton.vue';

describe('FSkeleton', () => {
  it('décoratif, avec le nombre de lignes demandé et la dernière raccourcie', () => {
    const { container } = render(FSkeleton, { props: { lines: 3, width: '20rem' } });
    const root = container.querySelector('.f-skeleton');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    const lines = container.querySelectorAll<HTMLElement>('.f-skeleton__line');
    expect(lines).toHaveLength(3);
    expect(lines[2]?.style.inlineSize).toBe('calc(20rem * 0.6)');
  });
});
