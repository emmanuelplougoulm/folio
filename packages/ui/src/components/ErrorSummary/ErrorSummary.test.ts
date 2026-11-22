import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import FErrorSummary, { type ErrorSummaryItem } from './ErrorSummary.vue';

const errors: ErrorSummaryItem[] = [
  { id: 'email', message: 'Saisissez votre adresse e-mail.' },
  { id: 'password', message: 'Saisissez votre mot de passe.' }
];

describe('FErrorSummary', () => {
  it('ne rend rien sans erreur', () => {
    render(FErrorSummary, { props: { title: 'Erreurs', errors: [] } });
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('région nommée par le titre, avec un lien par erreur', () => {
    render(FErrorSummary, {
      props: { title: 'Le formulaire contient 2 erreurs', errors }
    });
    const region = screen.getByRole('region', {
      name: 'Le formulaire contient 2 erreurs'
    });
    expect(region).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getByRole('link', { name: 'Saisissez votre adresse e-mail.' })
    ).toHaveAttribute('href', '#email');
  });

  it('prend le focus quand des erreurs apparaissent', async () => {
    const list = ref<ErrorSummaryItem[]>([]);
    render({
      components: { FErrorSummary },
      setup: () => ({ list }),
      template: '<FErrorSummary title="Erreurs" :errors="list" />'
    });
    list.value = errors;
    await nextTick();
    await nextTick();
    expect(screen.getByRole('region', { name: 'Erreurs' })).toHaveFocus();
  });

  it('un clic sur une erreur place le focus dans le champ', async () => {
    render({
      components: { FErrorSummary },
      setup: () => ({ errors }),
      template: `
        <FErrorSummary title="Erreurs" :errors="errors" :auto-focus="false" />
        <label for="email">E-mail</label><input id="email" />
        <label for="password">Mot de passe</label><input id="password" type="password" />`
    });
    window.HTMLElement.prototype.scrollIntoView = () => undefined;
    await userEvent.click(
      screen.getByRole('link', { name: 'Saisissez votre mot de passe.' })
    );
    expect(screen.getByLabelText('Mot de passe')).toHaveFocus();
  });
});
