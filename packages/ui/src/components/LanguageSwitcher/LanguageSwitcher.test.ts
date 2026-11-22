import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FLanguageSwitcher from './LanguageSwitcher.vue';

describe('FLanguageSwitcher', () => {
  it('un lien par langue, prononcé dans sa langue, langue courante marquée', () => {
    render(FLanguageSwitcher, {
      props: {
        label: 'Langue',
        current: 'fr',
        languages: [
          { code: 'fr', label: 'Français', link: { href: '/fr/account' } },
          { code: 'es', label: 'Español', link: { href: '/es/account' } }
        ]
      }
    });
    expect(screen.getByRole('navigation', { name: 'Langue' })).toBeInTheDocument();
    const fr = screen.getByRole('link', { name: 'Français' });
    const es = screen.getByRole('link', { name: 'Español' });
    expect(fr).toHaveAttribute('aria-current', 'true');
    expect(es).not.toHaveAttribute('aria-current');
    expect(es).toHaveAttribute('lang', 'es');
    expect(es).toHaveAttribute('hreflang', 'es');
    expect(es).toHaveAttribute('href', '/es/account');
  });
});
