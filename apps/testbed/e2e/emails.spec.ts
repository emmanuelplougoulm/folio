import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ACCOUNTS, DEMO_PASSWORD } from '../src/mocks/accounts';
import { TEST_CARDS } from '../src/mocks/cards';
import { choosePickupPoint } from './helpers';

/** Commande invité complète, payée, dans la langue demandée. Renvoie le numéro de commande. */
async function placeOrder(page: Page, locale: 'fr' | 'es', email: string) {
  const l = {
    fr: {
      next: 'Continuer',
      relay: 'Retrait en point relais',
      point: 'Point relais',
      terms: "J'accepte les conditions générales de vente",
      toPayment: 'Continuer vers le paiement',
      email: 'Adresse e-mail',
      number: 'Numéro de carte',
      expiry: "Date d'expiration",
      cvc: 'Cryptogramme',
      name: 'Nom du titulaire',
      pay: /^Payer /,
      offer: 'Plus'
    },
    es: {
      next: 'Continuar',
      relay: 'Recogida en punto de entrega',
      point: 'Punto de recogida',
      terms: 'Acepto las condiciones generales de venta',
      toPayment: 'Continuar al pago',
      email: 'Correo electrónico',
      number: 'Número de tarjeta',
      expiry: 'Fecha de caducidad',
      cvc: 'Código de seguridad',
      name: 'Nombre del titular',
      pay: /^Pagar /,
      offer: 'Plus'
    }
  }[locale];
  await page.goto(`/${locale}/order?process=v1`);
  await page.getByLabel(l.offer).check();
  await page.getByRole('button', { name: l.next }).click();
  await page.getByRole('radio', { name: l.relay }).check();
  await choosePickupPoint(page, 'sevilla', 'Quiosco Triana', l.point);
  await page.getByRole('button', { name: l.next }).click();
  await page.getByLabel(l.terms).check();
  await page.getByRole('button', { name: l.toPayment }).click();
  await page.getByLabel(l.email).fill(email);
  await page.getByLabel(l.number).fill(TEST_CARDS.success);
  await page.getByLabel(l.expiry).fill('12/30');
  await page.getByLabel(l.cvc).fill('123');
  await page.getByLabel(l.name).fill('Lucía García');
  await page.getByRole('button', { name: l.pay }).click();
  await expect(page).toHaveURL(`/${locale}/order/confirmation`);
  return (await page.getByRole('status').locator('.tb-code').textContent()) ?? '';
}

test.describe('e-mails', () => {
  test('boîte de test vide : invitation à commander', async ({ page }) => {
    await page.goto('/fr/outbox');
    await expect(
      page.getByRole('heading', { name: 'Aucun e-mail pour l’instant'.replace('’', "'") })
    ).toBeVisible();
  });

  test('commande en espagnol : confirmation en espagnol, HTML et texte', async ({
    page
  }) => {
    const number = await placeOrder(page, 'es', 'lucia@ejemplo.es');
    await page.goto('/es/outbox');

    const table = page.getByRole('table', { name: 'Correos enviados' });
    const row = table.getByRole('row').filter({ hasText: `Pedido ${number} confirmado` });
    await expect(row).toContainText('lucia@ejemplo.es');
    await expect(row).toContainText('Español');

    const preview = page.frameLocator('iframe[title^="Vista previa del correo"]');
    await expect(preview.locator('html')).toHaveAttribute('lang', 'es');
    await expect(preview.getByRole('heading', { level: 1 })).toHaveText(
      'Gracias por tu pedido'
    );
    await expect(preview.getByText('Hola, Lucía García:')).toBeVisible();
    await expect(preview.getByRole('rowheader', { name: 'Total pagado' })).toBeVisible();
    await expect(preview.getByText('19,90 €')).toBeVisible();
    await expect(preview.getByRole('link', { name: 'Seguir mi pedido' })).toHaveAttribute(
      'href',
      /\/es\/account$/
    );

    await page.getByText('Versión de texto').click();
    await expect(page.locator('pre')).toContainText(
      `Tu pedido ${number} está confirmado.`
    );
    await expect(page.locator('pre')).toContainText(
      'Entrega: Recogida en punto de entrega · Quiosco Triana'
    );
  });

  test('connexion : alerte de sécurité en français, adressée au compte', async ({
    page
  }) => {
    await page.goto('/fr/login');
    await page.getByLabel('Adresse e-mail').fill(ACCOUNTS.demo.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/fr/account');

    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Boîte de test' })
      .click();
    const row = page
      .getByRole('row')
      .filter({ hasText: 'Nouvelle connexion à votre compte' });
    await expect(row).toContainText(ACCOUNTS.demo.email);
    const preview = page.frameLocator('iframe[title^="Aperçu de l\'e-mail"]');
    await expect(preview.getByText(`Bonjour ${ACCOUNTS.demo.name},`)).toBeVisible();
    await expect(
      preview.getByText(
        "Si ce n'était pas vous, changez votre mot de passe dès maintenant."
      )
    ).toBeVisible();
  });

  test('connecté : l’e-mail de confirmation est pré-rempli et utilisé', async ({
    page
  }) => {
    await page.goto('/fr/login');
    await page.getByLabel('Adresse e-mail').fill(ACCOUNTS.newcomer.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('/fr/account');

    await page.goto('/fr/order?process=v1');
    await page.getByLabel('Pro').check();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
    await choosePickupPoint(page, 'lyon', 'Librairie du Rhône');
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByLabel("J'accepte les conditions générales de vente").check();
    await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();
    await expect(page.getByLabel('Adresse e-mail')).toHaveValue(ACCOUNTS.newcomer.email);
    await page.getByLabel('Numéro de carte').fill(TEST_CARDS.success);
    await page.getByLabel("Date d'expiration").fill('12/30');
    await page.getByLabel('Cryptogramme').fill('123');
    await page.getByLabel('Nom du titulaire').fill('Nina Nouvelle');
    await page.getByRole('button', { name: /^Payer / }).click();
    await expect(page).toHaveURL('/fr/order/confirmation');

    await page.goto('/fr/outbox');
    const rows = page.getByRole('table', { name: 'E-mails envoyés' }).getByRole('row');
    // En-tête, puis confirmation de commande (la plus récente), puis alerte de connexion.
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(1)).toContainText('confirmée');
    await expect(rows.nth(1)).toContainText(ACCOUNTS.newcomer.email);
  });

  test('e-mail invalide au paiement : erreur reliée au champ', async ({ page }) => {
    await page.goto('/fr/order?process=v1');
    await page.getByLabel('Essentiel').check();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('radio', { name: 'Retrait en point relais' }).check();
    await choosePickupPoint(page, 'lyon', 'Librairie du Rhône');
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByLabel("J'accepte les conditions générales de vente").check();
    await page.getByRole('button', { name: 'Continuer vers le paiement' }).click();
    await page.getByLabel('Adresse e-mail').fill('ana@');
    await page.getByRole('button', { name: /^Payer / }).click();
    await expect(page.getByLabel('Adresse e-mail')).toHaveAccessibleDescription(
      'Nous y envoyons la confirmation de commande. Saisissez une adresse e-mail au format nom@exemple.fr.'
    );
  });

  test('ouvrir un autre e-mail, puis vider la boîte', async ({ page }) => {
    await page.goto('/fr/login');
    await page.getByLabel('Adresse e-mail').fill(ACCOUNTS.demo.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await page.goto('/en/login');
    await page.getByLabel('Email address').fill(ACCOUNTS.demo.email);
    await page.getByLabel('Password', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/en/account');

    await page.goto('/en/outbox');
    const subjects = page
      .getByRole('table', { name: 'Sent emails' })
      .getByRole('rowheader');
    await expect(subjects).toHaveText([
      'New sign-in to your account',
      'Nouvelle connexion à votre compte'
    ]);
    await subjects.nth(1).getByRole('button').click();
    await expect(subjects.nth(1).getByRole('button')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute(
      'lang',
      'fr'
    );

    await page.getByRole('button', { name: 'Empty inbox' }).click();
    await expect(page.getByRole('heading', { name: 'No emails yet' })).toBeVisible();
  });

  test.describe('accessibilité de la boîte de test (axe, WCAG 2.2 AA)', () => {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`page et HTML de l’e-mail, thème ${colorScheme}`, async ({
        page,
        context
      }) => {
        await page.emulateMedia({ colorScheme });
        await placeOrder(page, 'fr', 'ana@exemple.fr');
        await page.goto('/fr/outbox');
        await expect(
          page.frameLocator('iframe').getByRole('heading', { level: 1 })
        ).toBeVisible();

        // La page, hors aperçu : l'iframe est isolée (sandbox sans script), axe n'y entre pas.
        const pageResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .exclude('iframe')
          .analyze();
        expect(pageResults.violations).toEqual([]);

        // Le HTML de l'e-mail, chargé tel quel dans une page vierge, comme un client de messagerie.
        const html = await page.evaluate(() => {
          const outbox = JSON.parse(
            sessionStorage.getItem('folio-testbed:outbox') ?? '[]'
          ) as {
            html: string;
          }[];
          return outbox[0]?.html ?? '';
        });
        const email = await context.newPage();
        await email.setContent(html);
        const emailResults = await new AxeBuilder({ page: email })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(emailResults.violations).toEqual([]);
      });
    }
  });
});
