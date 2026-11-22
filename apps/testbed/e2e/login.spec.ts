import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';

const loginForm = (page: Page) => ({
  email: page.getByLabel('Adresse e-mail'),
  password: page.getByLabel('Mot de passe', { exact: true }),
  submit: page.getByRole('button', { name: 'Se connecter' })
});

test.describe('connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/login');
  });

  test('a un titre de page et des champs requis typés', async ({ page }) => {
    await expect(page).toHaveTitle("Connexion · Banc d'essai Folio");
    const { email, password } = loginForm(page);
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('autocomplete', 'username');
    await expect(email).toHaveJSProperty('required', true);
    await expect(password).toHaveAttribute('autocomplete', 'current-password');
  });

  test('soumission vide : récapitulatif focalisé, erreurs reliées aux champs', async ({
    page
  }) => {
    const { email, password, submit } = loginForm(page);
    await submit.click();

    const summary = page.getByRole('region', {
      name: 'Le formulaire contient 2 erreurs'
    });
    await expect(summary).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Saisissez votre adresse e-mail.');
    await expect(password).toHaveAccessibleDescription('Saisissez votre mot de passe.');

    await summary.getByRole('link', { name: 'Saisissez votre mot de passe.' }).click();
    await expect(password).toBeFocused();
  });

  test('après la soumission, les erreurs des champs suivent la saisie', async ({
    page
  }) => {
    const { email, password, submit } = loginForm(page);
    await email.fill('ana');
    await submit.click();
    await expect(email).toHaveAccessibleDescription(
      'Saisissez une adresse e-mail au format nom@exemple.fr.'
    );
    await email.fill('ana@exemple.fr');
    await expect(email).not.toHaveAttribute('aria-invalid');
    await expect(password).toHaveAttribute('aria-invalid', 'true');

    // Le récapitulatif, lui, ne change qu'à la soumission suivante.
    await submit.click();
    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 1 erreur' })
    ).toBeFocused();
  });

  test('identifiants incorrects : alerte annoncée, pas de redirection', async ({
    page
  }) => {
    const { email, password, submit } = loginForm(page);
    await email.fill(ACCOUNTS.demo.email);
    await password.fill('mauvais');
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('Connexion impossible');
    await expect(page.getByRole('alert')).toContainText(
      'Adresse e-mail ou mot de passe incorrect'
    );
    await expect(page).toHaveURL('/fr/login');
  });

  test('compte verrouillé : message dédié', async ({ page }) => {
    const { email, password, submit } = loginForm(page);
    await email.fill(ACCOUNTS.locked.email);
    await password.fill(DEMO_PASSWORD);
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('Ce compte est verrouillé');
  });

  test('succès : état de chargement, compte affiché, puis déconnexion', async ({
    page
  }) => {
    const { email, password, submit } = loginForm(page);
    await email.fill(ACCOUNTS.demo.email);
    await password.fill(DEMO_PASSWORD);
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');

    await expect(page).toHaveURL('/fr/account');
    await expect(page).toHaveTitle(/^Mon compte · /);
    await expect(page.getByText(`Bonjour ${ACCOUNTS.demo.name}`)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mon compte' })).toBeVisible();

    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL('/fr');
    await expect(
      page
        .getByRole('navigation', { name: 'Navigation principale' })
        .getByRole('link', { name: 'Se connecter' })
    ).toBeVisible();
  });

  test('afficher le mot de passe', async ({ page }) => {
    const { password } = loginForm(page);
    await password.fill('secret');
    await page.getByRole('button', { name: 'Afficher' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Masquer' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('au clavier seul', async ({ page }) => {
    const { email, password } = loginForm(page);
    await email.focus();
    await page.keyboard.type(ACCOUNTS.demo.email);
    await page.keyboard.press('Tab');
    await expect(password).toBeFocused();
    await page.keyboard.type(DEMO_PASSWORD);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/fr/account');
  });
});

test('page protégée : redirection vers la connexion, puis retour', async ({ page }) => {
  await page.goto('/es/account');
  await expect(page).toHaveURL('/es/login?redirect=/es/account');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Iniciar sesión');
  await page.getByLabel('Correo electrónico').fill(ACCOUNTS.demo.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/es/account');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi cuenta');
});

test('les erreurs sont traduites (espagnol)', async ({ page }) => {
  await page.goto('/es/login');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(
    page.getByRole('region', { name: 'El formulario contiene 2 errores' })
  ).toBeFocused();
  await expect(page.getByLabel('Correo electrónico')).toHaveAccessibleDescription(
    'Introduce tu correo electrónico.'
  );
});

test.describe('accessibilité de la connexion (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`formulaire en erreur, thème ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/en/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByRole('region', { name: /problems/ })).toBeFocused();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test(`échec de connexion, thème ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/en/login');
      await page.getByLabel('Email address').fill(ACCOUNTS.locked.email);
      await page.getByLabel('Password', { exact: true }).fill(DEMO_PASSWORD);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
