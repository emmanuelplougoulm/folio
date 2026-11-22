import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

async function signIn(page: Page, redirect = '') {
  await page.goto(
    `/fr/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`
  );
  await page.getByLabel('Adresse e-mail').fill(ACCOUNTS.demo.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
}

test.describe('compte : fil d’Ariane, chargement et panne du service', () => {
  test('fil d’Ariane et état de chargement annoncé', async ({ page }) => {
    await signIn(page);
    const breadcrumb = page.getByRole('navigation', { name: "Fil d'Ariane" });
    await expect(breadcrumb.getByRole('link', { name: 'Accueil' })).toHaveAttribute(
      'href',
      '/fr'
    );
    await expect(breadcrumb.getByText('Mon compte')).toHaveAttribute(
      'aria-current',
      'page'
    );

    await expect(
      page.getByRole('status').filter({ hasText: 'Chargement des commandes' })
    ).toBeVisible();
    await expect(page.getByRole('table', { name: 'Mes commandes' })).toBeVisible();
    await expect(page.getByText('Chargement des commandes')).toHaveCount(0);
  });

  test('service des commandes en panne : alerte, puis Réessayer', async ({ page }) => {
    await signIn(page, '/fr/account?simulate=orders-error');
    const alert = page.getByRole('alert').filter({ hasText: 'Commandes indisponibles' });
    await expect(alert).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    expect((await axe(page)).violations).toEqual([]);

    await alert.getByRole('button', { name: 'Réessayer' }).click();
    await expect(page.getByRole('table', { name: 'Mes commandes' })).toBeVisible();
  });
});

test.describe('point relais : combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/order');
    await page.getByLabel('Plus').check();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
  });

  test('recherche insensible aux accents, sur le nom et l’adresse', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Point relais', exact: true });
    await input.fill('epicerie');
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option')).toContainText('Épicerie Sablon');

    await input.fill('41010');
    await expect(page.getByRole('option')).toHaveCount(1);
    await expect(page.getByRole('option')).toContainText('Quiosco Triana');
  });

  test('au clavier : flèche bas puis Entrée', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Point relais', exact: true });
    await input.fill('lyon');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(input).toHaveValue('Librairie du Rhône');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('aucun résultat : message dans la liste, liste ouverte accessible', async ({
    page
  }) => {
    await page.getByRole('combobox', { name: 'Point relais', exact: true }).fill('zzz');
    await expect(
      page.getByRole('option', { name: 'Aucun point relais trouvé' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect((await axe(page)).violations).toEqual([]);
  });

  test('liste ouverte et filtrée : aucune violation axe', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Point relais', exact: true });
    await input.fill('a');
    await input.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
  });
});

test('paiement : l’info-bulle de sécurité s’ouvre au focus et se ferme avec Échap', async ({
  page
}) => {
  await page.goto('/fr/order');
  await page.getByLabel('Essentiel').check();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
  const input = page.getByRole('combobox', { name: 'Point relais', exact: true });
  await input.fill('lyon');
  await page.getByRole('option', { name: /^Librairie du Rhône/ }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel("J'accepte les conditions générales de vente").check();
  await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();

  // Attendre que l'app ait placé le focus sur le titre (après la navigation), sinon il
  // arrive après le nôtre et le vole.
  await expect(page.getByRole('heading', { level: 1, name: 'Paiement' })).toBeFocused();
  // Vraie tabulation clavier depuis « Retour », l'élément qui précède le déclencheur.
  const trigger = page.getByRole('button', { name: 'Sécurité du paiement' });
  await page.getByRole('link', { name: 'Retour' }).focus();
  await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toContainText(
    'aucune donnée de carte ne quitte votre navigateur'
  );
  await expect(trigger).toHaveAccessibleDescription(
    'Paiement simulé : aucune donnée de carte ne quitte votre navigateur.'
  );
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
});

test.describe('pages d’erreur', () => {
  test('404 : fil d’Ariane et retour à l’accueil', async ({ page }) => {
    await page.goto('/es/no-existe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Página no encontrada'
    );
    await expect(
      page
        .getByRole('navigation', { name: 'Ruta de navegación' })
        .getByText('Página no encontrada')
    ).toHaveAttribute('aria-current', 'page');
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL('/es');
  });

  test('erreur de rendu : page d’erreur localisée au lieu d’un écran blanc', async ({
    page
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/en/__crash');
    await expect(page).toHaveURL('/en/error');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Something went wrong'
    );
    await expect(page).toHaveTitle(/^Something went wrong · /);
    await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(0);
    expect(errors.join('\n')).toContain('/__crash');
    expect((await axe(page)).violations).toEqual([]);

    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/en');
  });
});
