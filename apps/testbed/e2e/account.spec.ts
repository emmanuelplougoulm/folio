import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';
import { TEST_CARDS } from '../src/mocks/cards';

async function signIn(page: Page, email: string) {
  await page.goto('/fr/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL('/fr/account');
}

const notifications = (page: Page) =>
  page.getByRole('region', { name: /^Notifications/ });

test.describe('notifications', () => {
  test('connexion : notification de bienvenue, fermable', async ({ page }) => {
    await signIn(page, ACCOUNTS.demo.email);
    const toast = notifications(page)
      .getByRole('listitem')
      .filter({ hasText: 'Vous êtes connecté' });
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(`Bienvenue, ${ACCOUNTS.demo.name}.`);
    await toast.getByRole('button', { name: 'Fermer la notification' }).click();
    await expect(toast).toBeHidden();
  });

  test('la notification disparaît seule après 6 secondes', async ({ page }) => {
    await page.clock.install();
    await signIn(page, ACCOUNTS.demo.email);
    const toast = notifications(page).getByText('Vous êtes connecté');
    await expect(toast).toBeVisible();
    await page.clock.runFor(7000);
    await expect(toast).toBeHidden();
  });

  test('la région est atteignable au clavier par F8', async ({ page }) => {
    await signIn(page, ACCOUNTS.demo.email);
    await expect(notifications(page).getByText('Vous êtes connecté')).toBeVisible();
    // F8 place le focus sur la liste des notifications, puis Tab parcourt chacune.
    await page.keyboard.press('F8');
    await expect(notifications(page).getByRole('list')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(notifications(page).getByRole('listitem').first()).toBeFocused();
  });

  test('déconnexion : notification et retour à l’accueil', async ({ page }) => {
    await signIn(page, ACCOUNTS.demo.email);
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL('/fr');
    await expect(notifications(page).getByText('Vous êtes déconnecté')).toBeVisible();
  });

  test('notifications traduites (espagnol)', async ({ page }) => {
    await page.goto('/es/login');
    await page.getByLabel('Correo electrónico').fill(ACCOUNTS.demo.email);
    await page.getByLabel('Contraseña', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(
      page
        .getByRole('region', { name: /^Notificaciones/ })
        .getByText('Has iniciado sesión')
    ).toBeVisible();
  });
});

test.describe('historique des commandes', () => {
  test('compte de démonstration : commandes passées avec leur statut', async ({
    page
  }) => {
    await signIn(page, ACCOUNTS.demo.email);
    const orders = page.getByRole('region', { name: 'Mes commandes' });
    const delivered = orders.getByRole('article', { name: 'Commande FO-482913' });
    await expect(delivered).toContainText('Livrée');
    await expect(delivered).toContainText('3 octobre 2026');
    await expect(delivered).toContainText('24,80 €');
    await expect(
      orders.getByRole('article', { name: 'Commande FO-317204' })
    ).toContainText('Annulée');
  });

  test('nouveau compte : état vide avec invitation à commander', async ({ page }) => {
    await signIn(page, ACCOUNTS.newcomer.email);
    const orders = page.getByRole('region', { name: 'Mes commandes' });
    await expect(
      orders.getByRole('heading', { name: 'Passez votre première commande' })
    ).toBeVisible();
    await expect(orders.getByRole('article')).toHaveCount(0);
    await orders.getByRole('link', { name: 'Commencer une commande' }).click();
    await expect(page).toHaveURL('/fr/order/offer');
  });

  test('une commande passée connecté apparaît en tête, confirmée', async ({ page }) => {
    await signIn(page, ACCOUNTS.newcomer.email);
    await page.goto('/fr/order');
    await page.getByLabel('Pro').check();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
    await page.getByRole('combobox', { name: 'Point relais' }).selectOption('lyon-2');
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByLabel("J'accepte les conditions générales de vente").check();
    await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();
    await page.getByLabel('Numéro de carte').fill(TEST_CARDS.success);
    await page.getByLabel("Date d'expiration").fill('12/30');
    await page.getByLabel('Cryptogramme').fill('123');
    await page.getByLabel('Nom du titulaire').fill('Nina Nouvelle');
    await page.getByRole('button', { name: /^Payer/ }).click();

    await expect(page).toHaveURL('/fr/order/confirmation');
    const number =
      (await page.getByRole('status').locator('.tb-code').textContent()) ?? '';
    await page.getByRole('link', { name: 'Voir mes commandes' }).click();

    const first = page
      .getByRole('region', { name: 'Mes commandes' })
      .getByRole('article')
      .first();
    await expect(first).toHaveAccessibleName(`Commande ${number}`);
    await expect(first).toContainText('Confirmée');
    await expect(first).toContainText('39,90 €');
  });
});

test.describe('accessibilité du compte (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const [label, email] of [
      ['historique', ACCOUNTS.demo.email],
      ['état vide', ACCOUNTS.newcomer.email]
    ] as const) {
      test(`${label}, notification visible, thème ${colorScheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await signIn(page, email);
        await expect(notifications(page).getByText('Vous êtes connecté')).toBeVisible();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
