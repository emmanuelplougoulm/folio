import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';
import { TEST_CARDS } from '../src/mocks/cards';
import { choosePickupPoint } from './helpers';

const stepper = (page: Page) =>
  page.getByRole('navigation', { name: 'Étapes de la commande' }).getByRole('listitem');
const versionNote = (page: Page) =>
  page.getByText(/^Commande en version \d du processus/);
const next = (page: Page) => page.getByRole('button', { name: 'Continuer', exact: true });

async function chooseOffer(page: Page, offer: string) {
  await page.getByLabel(offer).check();
  await next(page).click();
  await expect(page).toHaveURL('/fr/order/delivery');
}

async function deliverHome(page: Page) {
  await page.getByRole('radio', { name: 'Livraison à domicile' }).check();
  await page.getByLabel('Nom complet').fill('Ana Demo');
  await page.getByLabel('Adresse', { exact: true }).fill('12 rue des Lilas');
  await page.getByLabel('Code postal').fill('75011');
  await page.getByLabel('Ville').fill('Paris');
  await page.getByLabel('Pays').selectOption('FR');
  await next(page).click();
}

async function deliverToRelay(page: Page) {
  await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
  await choosePickupPoint(page, 'lyon', 'Librairie du Rhône');
  await next(page).click();
}

async function fillContact(page: Page, email: string, phone = '') {
  await expect(page).toHaveURL('/fr/order/contact');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Téléphone (facultatif)').fill(phone);
  await next(page).click();
}

async function toPayment(page: Page) {
  await expect(page).toHaveURL('/fr/order/review');
  await page.getByLabel("J'accepte les conditions générales de vente").check();
  await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();
  await expect(page).toHaveURL('/fr/order/payment');
}

async function payWithCard(page: Page) {
  await page.getByLabel('Numéro de carte').fill(TEST_CARDS.success);
  await page.getByLabel("Date d'expiration").fill('12/30');
  await page.getByLabel('Cryptogramme').fill('123');
  await page.getByLabel('Nom du titulaire').fill('Ana Demo');
  await page.getByRole('button', { name: /^Payer / }).click();
  await expect(page).toHaveURL('/fr/order/confirmation');
}

/** Choisit la version des nouvelles commandes sur la page des versions. */
async function setDefaultVersion(page: Page, version: 'version 1' | 'version 2') {
  await page.goto('/fr/process');
  await page.getByRole('radio', { name: version }).check();
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByRole('region', { name: /^Notifications/ })).toContainText(
    `Les nouvelles commandes suivront la ${version}`
  );
}

test.describe('processus versionné : v2 par défaut', () => {
  test('FOL-214 : coordonnées avant le récapitulatif, plus d’e-mail au paiement', async ({
    page
  }) => {
    await page.goto('/fr/order');
    await expect(stepper(page)).toHaveText([
      /Offre/,
      /Livraison/,
      /Coordonnées/,
      /Récapitulatif/,
      /Paiement/
    ]);
    await expect(versionNote(page)).toHaveText(/version 2/);

    await chooseOffer(page, 'Plus');
    await deliverToRelay(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos coordonnées');
    await fillContact(page, 'ana@exemple.fr', '06 12 34 56 78');

    const contact = page.getByRole('region', { name: 'Coordonnées' });
    await expect(contact).toContainText('ana@exemple.fr');
    await expect(contact).toContainText('06 12 34 56 78');
    await page.getByRole('link', { name: 'Retour' }).click();
    await expect(page).toHaveURL('/fr/order/contact');
    await expect(page.getByLabel('Adresse e-mail')).toHaveValue('ana@exemple.fr');
    await next(page).click();

    await toPayment(page);
    await expect(page.getByLabel('Adresse e-mail')).toHaveCount(0);
    await payWithCard(page);

    // L'e-mail saisi à l'étape Coordonnées reçoit la confirmation.
    await page.goto('/fr/outbox');
    const sent = page.getByRole('table', { name: 'E-mails envoyés' });
    await expect(sent.getByRole('row').nth(1)).toContainText('ana@exemple.fr');
    await expect(sent.getByRole('row').nth(1)).toContainText(/commande/i);
  });

  test('FOL-214 : coordonnées invalides, récapitulatif d’erreurs', async ({ page }) => {
    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');
    await deliverToRelay(page);
    await fillContact(page, 'ana@', '0612');

    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 2 erreurs' })
    ).toBeFocused();
    await expect(page.getByLabel('Adresse e-mail')).toHaveAccessibleDescription(
      /Nous y enverrons la confirmation de commande\..+/
    );
    await expect(page.getByLabel('Téléphone (facultatif)')).toHaveAccessibleDescription(
      /Saisissez un numéro de téléphone valide/
    );
    await expect(page.getByLabel('Téléphone (facultatif)')).toHaveAttribute(
      'autocomplete',
      'tel'
    );

    // Le téléphone reste facultatif.
    await fillContact(page, 'ana@exemple.fr');
    await expect(page).toHaveURL('/fr/order/review');
  });

  test('FOL-214 : connecté, l’e-mail du compte est pré-rempli', async ({ page }) => {
    await page.goto('/fr/login');
    await page.getByLabel('Adresse e-mail').fill(ACCOUNTS.newcomer.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/fr/account');

    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');
    await deliverToRelay(page);
    await expect(page.getByLabel('Adresse e-mail')).toHaveValue(ACCOUNTS.newcomer.email);
  });

  test('impossible de sauter l’étape Coordonnées', async ({ page }) => {
    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');
    await deliverToRelay(page);
    await page.goto('/fr/order/review');
    await expect(page).toHaveURL('/fr/order/contact');
  });
});

test.describe('processus versionné : livraison offerte (FOL-221)', () => {
  for (const [version, amount] of [
    ['v1', 'Payer 44,80 €'],
    ['v2', 'Payer 39,90 €']
  ] as const) {
    test(`${version}, offre Pro livrée à domicile : ${amount}`, async ({ page }) => {
      await page.goto(`/fr/order?process=${version}`);
      await chooseOffer(page, 'Pro');
      await deliverHome(page);
      if (version === 'v2') await fillContact(page, 'ana@exemple.fr');
      await toPayment(page);
      await expect(page.getByRole('button', { name: amount })).toBeVisible();
    });
  }

  test('v2 : le seuil ne vaut que pour l’offre Pro', async ({ page }) => {
    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');
    await deliverHome(page);
    await fillContact(page, 'ana@exemple.fr');
    await toPayment(page);
    await expect(page.getByRole('button', { name: 'Payer 24,80 €' })).toBeVisible();
  });
});

test.describe('processus versionné : version figée', () => {
  test('une commande commencée garde sa version quand le réglage change', async ({
    page
  }) => {
    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');

    await setDefaultVersion(page, 'version 1');
    await expect(
      page.getByText('La commande en cours reste en version 2.')
    ).toBeVisible();

    await page.goto('/fr/order/delivery');
    await expect(stepper(page)).toHaveCount(5);
    await expect(versionNote(page)).toHaveText(/version 2/);

    // Le paramètre d'essai est ignoré pour une commande en cours, puis retiré de l'URL.
    await page.goto('/fr/order/delivery?process=v1');
    await expect(page).toHaveURL('/fr/order/delivery');
    await expect(stepper(page)).toHaveCount(5);
  });

  test('après une commande, la suivante suit le nouveau réglage', async ({ page }) => {
    await page.goto('/fr/order');
    await chooseOffer(page, 'Plus');
    await setDefaultVersion(page, 'version 1');

    await page.goto('/fr/order/delivery');
    await deliverToRelay(page);
    await fillContact(page, 'ana@exemple.fr');
    await toPayment(page);
    await payWithCard(page);

    await page.goto('/fr/order');
    await expect(stepper(page)).toHaveCount(4);
    await expect(versionNote(page)).toHaveText(/version 1/);
  });

  test('une commande v1 n’a pas d’étape Coordonnées', async ({ page }) => {
    await page.goto('/fr/order?process=v1');
    await expect(page).toHaveURL('/fr/order/offer');
    await expect(stepper(page)).toHaveCount(4);
    await chooseOffer(page, 'Plus');
    await deliverToRelay(page);
    await expect(page).toHaveURL('/fr/order/review');
    await page.goto('/fr/order/contact');
    await expect(page).toHaveURL('/fr/order/review');
  });

  test('brouillon enregistré avant les versions : repris en v1', async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('folio-testbed:order')) {
        sessionStorage.setItem(
          'folio-testbed:order',
          JSON.stringify({ offer: 'plus', method: 'relay', pickupPoint: 'lyon-2' })
        );
      }
    });
    await page.goto('/fr/order/review');
    await expect(page).toHaveURL('/fr/order/review');
    await expect(stepper(page)).toHaveCount(4);
    await expect(versionNote(page)).toHaveText(/version 1/);
  });
});

test.describe('notes de version', () => {
  test('versions, statut, étapes et tickets', async ({ page }) => {
    await page.goto('/fr');
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Versions' })
      .click();
    await expect(page).toHaveURL('/fr/process');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Versions du processus de commande'
    );

    const releases = page.getByRole('article');
    await expect(releases).toHaveCount(2);
    await expect(releases.nth(0).getByRole('heading')).toHaveText('version 2');
    await expect(releases.nth(0)).toContainText('Actuelle');
    await expect(releases.nth(0)).toContainText('Publiée le 16 novembre 2026');
    await expect(releases.nth(0)).toContainText(
      'Étapes : Offre → Livraison → Coordonnées → Récapitulatif → Paiement'
    );
    await expect(releases.nth(0).getByRole('listitem')).toHaveText([
      /^FOL-214/,
      /^FOL-221/
    ]);
    await expect(releases.nth(1)).toContainText('Maintenue');
    await expect(page.getByRole('radio', { name: 'version 2' })).toBeChecked();
  });

  test('en espagnol', async ({ page }) => {
    await page.goto('/es/process');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Versiones del proceso de pedido'
    );
    await expect(page.getByRole('article').first()).toContainText(
      'Publicada el 16 de noviembre de 2026'
    );
  });
});

test.describe('accessibilité du processus versionné (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`notes de version et étape Coordonnées en erreur, thème ${colorScheme}`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme });
      const axe = () =>
        new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

      await page.goto('/fr/process');
      expect((await axe()).violations).toEqual([]);

      await page.goto('/fr/order');
      await chooseOffer(page, 'Plus');
      await deliverToRelay(page);
      await next(page).click();
      await expect(page.getByRole('region', { name: /contient 1 erreur/ })).toBeFocused();
      expect((await axe()).violations).toEqual([]);
    });
  }
});
