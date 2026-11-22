import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FBadge from './Badge.vue';

describe('FBadge', () => {
  it('texte statique, sans rôle live', () => {
    render(FBadge, { props: { tone: 'success' }, slots: { default: 'Livrée' } });
    const badge = screen.getByText('Livrée');
    expect(badge).toHaveClass('f-badge--success', 'f-badge--md');
    expect(badge).not.toHaveAttribute('role');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
