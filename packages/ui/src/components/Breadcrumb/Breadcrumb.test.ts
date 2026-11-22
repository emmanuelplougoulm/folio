import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import FBreadcrumb from './Breadcrumb.vue';

describe('FBreadcrumb', () => {
  it('liste ordonnée dans une nav nommée ; page courante non cliquable', () => {
    render(FBreadcrumb, {
      props: {
        label: "Fil d'Ariane",
        items: [
          { label: 'Accueil', link: { href: '/fr' } },
          { label: 'Mon compte', link: { href: '/fr/account' } },
          { label: 'Préférences' }
        ]
      }
    });
    const nav = screen.getByRole('navigation', { name: "Fil d'Ariane" });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(within(nav).getByRole('link', { name: 'Accueil' })).toHaveAttribute(
      'href',
      '/fr'
    );
    expect(within(nav).queryByRole('link', { name: 'Préférences' })).toBeNull();
    expect(within(nav).getByText('Préférences')).toHaveAttribute('aria-current', 'page');
  });

  it('le dernier élément est la page courante même s’il a un lien', () => {
    render(FBreadcrumb, {
      props: {
        label: 'Fil',
        items: [
          { label: 'Accueil', link: { href: '/' } },
          { label: 'Ici', link: { href: '/ici' } }
        ]
      }
    });
    expect(screen.queryByRole('link', { name: 'Ici' })).toBeNull();
  });
});
