import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const titles = {
  fr: 'Un parcours de démonstration, testé de bout en bout',
  en: 'A demo journey, tested end to end',
  es: 'Un recorrido de demostración, probado de principio a fin'
} as const;

test.describe('redirection vers la langue du navigateur', () => {
  for (const [browserLocale, expected] of [
    ['es-ES', 'es'],
    ['en-GB', 'en'],
    ['fr-FR', 'fr'],
    ['de-DE', 'fr']
  ] as const) {
    test.describe(browserLocale, () => {
      test.use({ locale: browserLocale });

      test(`/ mène à /${expected}`, async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(`/${expected}`);
        await expect(page.locator('html')).toHaveAttribute('lang', expected);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          titles[expected]
        );
      });
    });
  }
});

test('le sélecteur de langue change la langue sans quitter la page', async ({ page }) => {
  await page.goto('/fr');
  const nav = page.getByRole('navigation', { name: 'Langue' });
  await expect(nav.getByRole('link', { name: 'Français' })).toHaveAttribute(
    'aria-current',
    'true'
  );

  await nav.getByRole('link', { name: 'Español' }).click();

  await expect(page).toHaveURL('/es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.es);
  await expect(
    page
      .getByRole('navigation', { name: 'Idioma' })
      .getByRole('link', { name: 'Español' })
  ).toHaveAttribute('aria-current', 'true');
});

test('une adresse inconnue affiche la page 404 dans la langue courante', async ({
  page
}) => {
  await page.goto('/en/nope');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles.en);
});

test('le lien d’évitement est le premier élément focusable et mène au contenu', async ({
  page
}) => {
  await page.goto('/fr');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Aller au contenu' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test.describe('accessibilité (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/fr', '/es', '/en/nope']) {
      test(`${path} en thème ${colorScheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});
