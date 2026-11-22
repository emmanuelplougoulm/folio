import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { choosePickupPoint } from './helpers';

const continueButton = (page: Page) => page.getByRole('button', { name: 'Continuer' });
const stepper = (page: Page) =>
  page.getByRole('navigation', { name: 'Étapes de la commande' });

async function chooseOffer(page: Page, name = 'Plus') {
  await page.goto('/fr/order');
  await page.getByLabel(name).check();
  await continueButton(page).click();
  await expect(page).toHaveURL('/fr/order/delivery');
}

async function fillHomeAddress(page: Page) {
  await page.getByLabel('Livraison à domicile').check();
  await page.getByLabel('Nom complet').fill('Ana Demo');
  await page.getByLabel('Adresse', { exact: true }).fill('12 rue des Lilas');
  await page.getByLabel('Code postal').fill('75011');
  await page.getByLabel('Ville').fill('Paris');
  await page.getByLabel('Pays').selectOption('FR');
}

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

test.describe('tunnel de commande', () => {
  test('étape 1 : offre obligatoire, carte entièrement cliquable', async ({ page }) => {
    await page.goto('/fr/order');
    await expect(page).toHaveURL('/fr/order/offer');
    await expect(stepper(page).getByRole('listitem').nth(0)).toHaveAttribute(
      'aria-current',
      'step'
    );

    await continueButton(page).click();
    const summary = page.getByRole('region', { name: 'Le formulaire contient 1 erreur' });
    await expect(summary).toBeFocused();
    await summary.getByRole('link', { name: 'Choisissez une offre.' }).click();
    await expect(page.getByLabel('Essentiel')).toBeFocused();

    // Clic aux coordonnées de la description : le libellé étiré la recouvre (c'est voulu),
    // donc on saute le contrôle « intercepte le pointeur » de Playwright.
    await page
      .getByText('Un panier par semaine et la livraison prioritaire')
      .click({ force: true });
    await expect(page.getByLabel('Pro')).toBeChecked();
    await expect(page.getByText('39,90 € par mois')).toBeVisible();
  });

  test('la navigation entre étapes place le focus sur le titre', async ({ page }) => {
    await chooseOffer(page);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Livraison' })
    ).toBeFocused();
    await expect(page).toHaveTitle(/^Livraison · /);
    await expect(stepper(page).getByRole('link', { name: 'Offre' })).toBeVisible();
  });

  test('étape 2 : la branche « domicile » exige une adresse valide pour le pays', async ({
    page
  }) => {
    await chooseOffer(page);
    await page.getByLabel('Livraison à domicile').check();
    await continueButton(page).click();
    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 5 erreurs' })
    ).toBeFocused();

    await fillHomeAddress(page);
    await page.getByLabel('Pays').selectOption('BE');
    await continueButton(page).click();
    await expect(page.getByLabel('Code postal')).toHaveAccessibleDescription(
      'Saisissez un code postal belge à 4 chiffres.'
    );
    await page.getByLabel('Code postal').fill('1000');
    await continueButton(page).click();
    await expect(page).toHaveURL('/fr/order/review');
  });

  test('étape 2 : la branche « point relais » ne demande que le point', async ({
    page
  }) => {
    await chooseOffer(page);
    await page.getByLabel('Retrait en point relais').check();
    await expect(page.getByLabel('Nom complet')).toHaveCount(0);
    await continueButton(page).click();
    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 1 erreur' })
    ).toBeFocused();
    await choosePickupPoint(page, 'lyon', 'Librairie du Rhône');
    await continueButton(page).click();
    await expect(page).toHaveURL('/fr/order/review');
    await expect(page.getByText('Librairie du Rhône')).toBeVisible();
    await expect(page.getByText('39,80 €')).toHaveCount(0);
  });

  test('compteur des instructions, traduit et relié au champ', async ({ page }) => {
    await chooseOffer(page);
    await page.getByLabel('Livraison à domicile').check();
    const instructions = page.getByLabel('Instructions de livraison (facultatif)');
    await instructions.fill('Code 1234B');
    await expect(instructions).toHaveAccessibleDescription(
      'Digicode, étage, horaires… Il reste 190 caractères'
    );
  });

  test('un lien direct vers une étape non atteinte ramène à la première étape incomplète', async ({
    page
  }) => {
    await page.goto('/fr/order/review');
    await expect(page).toHaveURL('/fr/order/offer');
  });

  test('récapitulatif : CGV obligatoires et total, puis paiement', async ({ page }) => {
    await chooseOffer(page);
    await fillHomeAddress(page);
    await continueButton(page).click();

    await expect(page.getByRole('region', { name: 'Livraison' })).toContainText(
      '12 rue des Lilas'
    );
    await expect(page.getByText('24,80 €')).toBeVisible();

    const submit = page.getByRole('button', { name: 'Continuer vers le paiement' });
    await submit.click();
    await expect(
      page.getByRole('region', { name: 'Le formulaire contient 1 erreur' })
    ).toBeFocused();
    await expect(
      page.getByLabel("J'accepte les conditions générales de vente")
    ).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel("J'accepte les conditions générales de vente").check();
    await submit.click();
    await expect(page).toHaveURL('/fr/order/payment');
    await expect(page.getByRole('heading', { level: 1, name: 'Paiement' })).toBeFocused();
  });

  test('le lien « Modifier » ramène à l’étape et conserve la saisie', async ({
    page
  }) => {
    await chooseOffer(page);
    await fillHomeAddress(page);
    await continueButton(page).click();
    await page.getByRole('link', { name: 'Modifier · Livraison' }).click();
    await expect(page).toHaveURL('/fr/order/delivery');
    await expect(page.getByLabel('Ville')).toHaveValue('Paris');
  });

  test('erreur serveur : point relais fermé, retour à la livraison proposé', async ({
    page
  }) => {
    await chooseOffer(page);
    await page.getByLabel('Retrait en point relais').check();
    await choosePickupPoint(page, 'Lille', 'Kiosque de la gare');
    await continueButton(page).click();
    await page.getByLabel("J'accepte les conditions générales de vente").check();
    await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Commande impossible');
    await alert.getByRole('link', { name: 'Modifier la livraison' }).click();
    await expect(page).toHaveURL('/fr/order/delivery');
    await expect(
      page.getByRole('combobox', { name: 'Point relais', exact: true })
    ).toHaveValue('Kiosque de la gare');
  });

  test('le brouillon survit à un rechargement', async ({ page }) => {
    await chooseOffer(page, 'Pro');
    await page.reload();
    await expect(page).toHaveURL('/fr/order/delivery');
    await page
      .getByRole('button', { name: 'Retour' })
      .or(page.getByRole('link', { name: 'Retour' }))
      .click();
    await expect(page.getByLabel('Pro')).toBeChecked();
  });
});

test('montants et messages localisés (anglais)', async ({ page }) => {
  await page.goto('/en/order');
  await expect(page.getByText('€19.90 per month')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(
    page.getByRole('region', { name: 'There is 1 problem with this form' })
  ).toBeFocused();
});

test.describe('accessibilité du tunnel (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`étapes en erreur, thème ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/es/order');
      await page.getByRole('button', { name: 'Continuar' }).click();
      expect((await axe(page)).violations).toEqual([]);

      await page.getByLabel('Plus').check();
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.getByLabel('Entrega a domicilio').check();
      await page.getByRole('button', { name: 'Continuar' }).click();
      await expect(page.getByRole('region', { name: /errores/ })).toBeFocused();
      expect((await axe(page)).violations).toEqual([]);
    });
  }
});
