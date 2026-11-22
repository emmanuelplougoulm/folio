import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CHALLENGE_CODE, TEST_CARDS } from '../src/mocks/cards';
import { choosePickupPoint } from './helpers';

/** Parcourt le tunnel jusqu'au paiement (offre Plus, point relais : total 19,90 €). */
async function reachPayment(page: Page, locale = 'fr') {
  const labels = {
    fr: {
      offer: 'Plus',
      relay: 'Retrait en point relais',
      point: 'Point relais',
      next: 'Continuer',
      terms: "J'accepte les conditions générales de vente",
      toPayment: 'Continuer vers le paiement'
    },
    en: {
      offer: 'Plus',
      relay: 'Pickup point',
      point: 'Pickup point',
      next: 'Continue',
      terms: 'I accept the terms and conditions of sale',
      toPayment: 'Continue to payment'
    }
  }[locale as 'fr' | 'en'];
  await page.goto(`/${locale}/order`);
  await page.getByLabel(labels.offer).check();
  await page.getByRole('button', { name: labels.next }).click();
  await page.getByRole('radio', { name: labels.relay }).check();
  await choosePickupPoint(page, 'lyon', 'Librairie du Rhône', labels.point);
  await page.getByRole('button', { name: labels.next }).click();
  await page.getByLabel(labels.terms).check();
  await page.getByRole('button', { name: labels.toPayment }).click();
  await expect(page).toHaveURL(`/${locale}/order/payment`);
}

const card = (page: Page) => ({
  number: page.getByLabel('Numéro de carte'),
  expiry: page.getByLabel("Date d'expiration"),
  cvc: page.getByLabel('Cryptogramme'),
  name: page.getByLabel('Nom du titulaire'),
  pay: page.getByRole('button', { name: /^Payer/ })
});

async function fillCard(page: Page, number: string) {
  const c = card(page);
  await c.number.fill(number);
  await c.expiry.fill('1230');
  await c.cvc.fill('123');
  await c.name.fill('Ana Demo');
}

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

test.describe('paiement', () => {
  test.beforeEach(async ({ page }) => {
    await reachPayment(page);
  });

  test('récapitulatif des montants et champs carte normalisés', async ({ page }) => {
    const amounts = page.getByRole('term');
    await expect(amounts.first()).toHaveText('Plus');
    await expect(page.getByRole('button', { name: 'Payer 19,90 €' })).toBeVisible();

    const c = card(page);
    await expect(c.number).toHaveAttribute('autocomplete', 'cc-number');
    await expect(c.number).toHaveAttribute('inputmode', 'numeric');
    await expect(c.expiry).toHaveAttribute('autocomplete', 'cc-exp');
    await expect(c.cvc).toHaveAttribute('autocomplete', 'cc-csc');
    await expect(c.name).toHaveAttribute('autocomplete', 'cc-name');

    await c.number.fill('4242424242424242');
    await c.number.blur();
    await expect(c.number).toHaveValue('4242 4242 4242 4242');
    await c.expiry.fill('0428');
    await c.expiry.blur();
    await expect(c.expiry).toHaveValue('04/28');
  });

  test('validation : numéro invalide (Luhn) et carte expirée', async ({ page }) => {
    const c = card(page);
    await c.number.fill('4242 4242 4242 4241');
    await c.expiry.fill('01/20');
    await c.pay.click();
    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 4 erreurs' })
    ).toBeFocused();
    await expect(c.number).toHaveAccessibleDescription(
      "Les 16 chiffres au recto de la carte. Vérifiez le numéro de carte : il n'est pas valide."
    );
    await expect(c.expiry).toHaveAccessibleDescription(
      'Au format MM/AA, par exemple 04/28. Cette carte est expirée.'
    );
  });

  test('paiement accepté sans vérification', async ({ page }) => {
    await fillCard(page, TEST_CARDS.success);
    await card(page).pay.click();
    await expect(card(page).pay).toHaveAttribute('aria-busy', 'true');
    await expect(page).toHaveURL('/fr/order/confirmation');
    await expect(page.getByRole('status')).toContainText(/FO-\d{6}/);
  });

  for (const [label, number, message] of [
    ['carte refusée', TEST_CARDS.declined, 'Votre banque a refusé le paiement'],
    [
      'solde insuffisant',
      TEST_CARDS.insufficientFunds,
      'Le solde de la carte est insuffisant'
    ]
  ] as const) {
    test(`échec : ${label}, on peut réessayer avec une autre carte`, async ({ page }) => {
      await fillCard(page, number);
      await card(page).pay.click();
      const alert = page.getByRole('alert');
      await expect(alert).toContainText('Paiement non abouti');
      await expect(alert).toContainText(message);
      await expect(page).toHaveURL('/fr/order/payment');

      await card(page).number.fill(TEST_CARDS.success);
      await card(page).pay.click();
      await expect(page).toHaveURL('/fr/order/confirmation');
    });
  }

  test('3-D Secure : dialogue modal, mauvais code puis bon code', async ({ page }) => {
    await fillCard(page, TEST_CARDS.challenge);
    await card(page).pay.click();

    const dialog = page.getByRole('dialog', { name: 'Confirmez votre paiement' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleDescription(
      `Saisissez le code reçu par SMS. Démo : ${CHALLENGE_CODE}.`
    );
    const code = dialog.getByLabel('Code de vérification');
    await expect(code).toHaveAttribute('autocomplete', 'one-time-code');

    await code.fill('000000');
    await dialog.getByRole('button', { name: 'Valider' }).click();
    await expect(code).toHaveAccessibleDescription(
      'Code incorrect. Il vous reste 2 essais.'
    );

    await code.fill(CHALLENGE_CODE);
    await code.press('Enter');
    await expect(page).toHaveURL('/fr/order/confirmation');
  });

  test('3-D Secure : trois mauvais codes font échouer le paiement', async ({ page }) => {
    await fillCard(page, TEST_CARDS.challenge);
    await card(page).pay.click();
    const dialog = page.getByRole('dialog');
    for (const remaining of ['Il vous reste 2 essais.', 'Il vous reste 1 essai.', null]) {
      await dialog.getByLabel('Code de vérification').fill('000000');
      await dialog.getByRole('button', { name: 'Valider' }).click();
      // Attendre la réponse avant l'essai suivant : pendant la vérification, Valider est bloqué.
      if (remaining) await expect(dialog.getByText(remaining)).toBeVisible();
    }
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('alert')).toContainText(
      'La vérification a échoué trop de fois'
    );
  });

  test('3-D Secure : Échap annule et rend le focus au bouton Payer', async ({ page }) => {
    await fillCard(page, TEST_CARDS.challenge);
    await card(page).pay.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(card(page).pay).toBeFocused();
    await expect(page.getByRole('alert')).toContainText(
      'Vous avez annulé la vérification'
    );
  });

  test('3-D Secure : le focus reste piégé dans le dialogue', async ({ page }) => {
    await fillCard(page, TEST_CARDS.challenge);
    await card(page).pay.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }
  });

  test('les données de carte ne sont jamais stockées', async ({ page }) => {
    await fillCard(page, TEST_CARDS.declined);
    await card(page).pay.click();
    await expect(page.getByRole('alert')).toBeVisible();
    const stored = await page.evaluate(() =>
      [sessionStorage, localStorage]
        .flatMap((storage) =>
          Object.keys(storage).map((key) => storage.getItem(key) ?? '')
        )
        .join('\n')
    );
    expect(stored).not.toContain('4000');
    expect(stored).not.toContain('Ana Demo');
  });
});

test('accès direct au paiement sans récapitulatif validé : retour au récapitulatif', async ({
  page
}) => {
  await reachPayment(page);
  await page.getByRole('link', { name: 'Retour' }).click();
  await expect(page).toHaveURL('/fr/order/review');
  await page.goto('/fr/order/payment');
  await expect(page).toHaveURL('/fr/order/review');
});

test.describe('accessibilité du paiement (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`formulaire en erreur puis dialogue ouvert, thème ${colorScheme}`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme });
      await reachPayment(page, 'en');
      await page.getByRole('button', { name: /^Pay €/ }).click();
      await expect(page.getByRole('region', { name: /problems/ })).toBeFocused();
      expect((await axe(page)).violations).toEqual([]);

      await page.getByLabel('Card number').fill(TEST_CARDS.challenge);
      await page.getByLabel('Expiry date').fill('12/30');
      await page.getByLabel('Security code').fill('123');
      await page.getByLabel('Name on card').fill('Ana Demo');
      await page.getByRole('button', { name: /^Pay €/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect((await axe(page)).violations).toEqual([]);
    });
  }
});
