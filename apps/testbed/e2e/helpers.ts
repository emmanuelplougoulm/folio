import { expect, type Page } from '@playwright/test';

/** Cherche un point relais dans le combobox et choisit l'option dont le nom commence par `name`. */
export async function choosePickupPoint(
  page: Page,
  search: string,
  name: string,
  label = 'Point relais'
) {
  const input = page.getByRole('combobox', { name: label, exact: true });
  await input.fill(search);
  await page.getByRole('option', { name: new RegExp(`^${name}`) }).click();
  await expect(input).toHaveValue(name);
}
