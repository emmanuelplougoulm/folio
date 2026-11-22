import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';
import { TEST_CARDS } from '../src/mocks/cards';
import { choosePickupPoint } from './helpers';

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
  const ordersTable = (page: Page) => page.getByRole('table', { name: 'Mes commandes' });

  test('compte de démonstration : tableau paginé, statuts en badge', async ({ page }) => {
    await signIn(page, ACCOUNTS.demo.email);
    const table = ordersTable(page);
    await expect(table.getByRole('row')).toHaveCount(6);
    const latest = table
      .getByRole('row')
      .filter({ has: page.getByRole('rowheader', { name: 'FO-482913' }) });
    await expect(latest).toContainText('3 oct. 2026');
    await expect(latest).toContainText('Livrée');
    await expect(latest).toContainText('24,80 €');
    await expect(table.getByRole('row').filter({ hasText: 'FO-481542' })).toContainText(
      'Annulée'
    );

    const pagination = page.getByRole('navigation', { name: 'Pagination des commandes' });
    await expect(pagination.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(pagination.getByRole('button', { name: 'Précédente' })).toBeDisabled();
  });

  test('changer de page : URL, focus sur le tableau, dernière page partielle', async ({
    page
  }) => {
    await signIn(page, ACCOUNTS.demo.email);
    const pagination = page.getByRole('navigation', { name: 'Pagination des commandes' });
    await pagination.getByRole('button', { name: 'Page 2' }).click();
    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(page.getByRole('region', { name: 'Mes commandes' })).toBeFocused();
    await expect(ordersTable(page).getByRole('rowheader').first()).toHaveText(
      'FO-476058'
    );

    await pagination.getByRole('button', { name: 'Suivante' }).click();
    await expect(ordersTable(page).getByRole('row')).toHaveCount(3);
    await expect(pagination.getByRole('button', { name: 'Suivante' })).toBeDisabled();

    // L'URL suffit à retrouver la page (lien partagé, rechargement).
    await page.reload();
    await expect(pagination.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('nouveau compte : état vide avec invitation à commander', async ({ page }) => {
    await signIn(page, ACCOUNTS.newcomer.email);
    await expect(
      page.getByRole('heading', { name: 'Passez votre première commande' })
    ).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page
      .getByRole('tabpanel')
      .getByRole('link', { name: 'Commencer une commande' })
      .click();
    await expect(page).toHaveURL('/fr/order/offer');
  });

  test('une commande passée connecté apparaît en tête, confirmée', async ({ page }) => {
    await signIn(page, ACCOUNTS.newcomer.email);
    await page.goto('/fr/order');
    await page.getByLabel('Pro').check();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
    await choosePickupPoint(page, 'lyon', 'Librairie du Rhône');
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

    const first = ordersTable(page).getByRole('row').nth(1);
    await expect(first.getByRole('rowheader')).toHaveText(number);
    await expect(first).toContainText('Confirmée');
    await expect(first).toContainText('39,90 €');
  });
});

test.describe('onglets et préférences', () => {
  test('onglets au clavier, onglet dans l’URL', async ({ page }) => {
    await signIn(page, ACCOUNTS.demo.email);
    const tabs = page.getByRole('tablist', { name: 'Sections du compte' });
    // Le focus de l'app sur le titre (après navigation) doit être passé avant le nôtre.
    await expect(
      page.getByRole('heading', { level: 1, name: 'Mon compte' })
    ).toBeFocused();
    await tabs.getByRole('tab', { name: 'Commandes' }).focus();
    await page.keyboard.press('ArrowRight');
    const preferences = tabs.getByRole('tab', { name: 'Préférences' });
    await expect(preferences).toBeFocused();
    await expect(preferences).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/[?&]tab=preferences/);
    await expect(page.getByRole('tabpanel', { name: 'Préférences' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('tab', { name: 'Préférences' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('interrupteurs, enregistrement et notification, conservés au rechargement', async ({
    page
  }) => {
    await signIn(page, ACCOUNTS.demo.email);
    await page.getByRole('tab', { name: 'Préférences' }).click();
    const group = page.getByRole('group', { name: 'Notifications par e-mail' });
    const tracking = group.getByRole('switch', { name: 'Suivi de commande' });
    const newsletter = group.getByRole('switch', { name: "Lettre d'information" });
    await expect(tracking).toBeChecked();
    await expect(newsletter).not.toBeChecked();
    await expect(newsletter).toHaveAccessibleDescription(
      'Les nouveautés du mois, une fois par mois.'
    );

    await newsletter.press('Space');
    await tracking.click();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(
      notifications(page).getByText('Vos préférences sont enregistrées')
    ).toBeVisible();

    await page.reload();
    await page.getByRole('tab', { name: 'Préférences' }).click();
    await expect(
      page.getByRole('switch', { name: 'Suivi de commande' })
    ).not.toBeChecked();
    await expect(
      page.getByRole('switch', { name: "Lettre d'information" })
    ).toBeChecked();
  });
});

test.describe('accessibilité du compte (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const [label, email] of [
      ['tableau des commandes', ACCOUNTS.demo.email],
      ['état vide', ACCOUNTS.newcomer.email]
    ] as const) {
      test(`${label}, notification visible, thème ${colorScheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await signIn(page, email);
        await expect(notifications(page).getByText('Vous êtes connecté')).toBeVisible();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations
        ).toEqual([]);
        await page.getByRole('tab', { name: 'Préférences' }).click();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
