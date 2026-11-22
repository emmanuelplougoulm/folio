import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import light from '../styles/tokens-light.generated.json';
import dark from '../styles/tokens-dark.generated.json';
import { contrastRatio } from '../tokens/contrast';

/** Convertit « ColorTextMuted » en « --f-color-text-muted ». */
const toCssVar = (key: string) =>
  `--f-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;

const rows = Object.keys(light).map((key) => {
  const l = (light as Record<string, string>)[key] ?? '';
  const d = (dark as Record<string, string>)[key] ?? '';
  return {
    name: toCssVar(key),
    light: l,
    dark: d,
    onBgLight: contrastRatio(l, light.ColorBg).toFixed(2),
    onBgDark: contrastRatio(d, dark.ColorBg).toFixed(2)
  };
});

const meta = {
  title: 'Fondations/Couleurs',
  parameters: { layout: 'padded' },
  tags: ['!autodocs']
} satisfies Meta;

export default meta;

/** Tokens de couleur sémantiques. Le contraste est mesuré sur le fond de page de chaque thème. */
export const Couleurs: StoryObj = {
  render: () => ({
    setup: () => ({ rows }),
    template: `
      <table style="border-collapse: collapse; font-size: var(--f-font-size-sm); width: 100%;">
        <caption style="text-align: start; font-family: var(--f-font-family-serif); font-size: var(--f-font-size-xl); padding-block-end: var(--f-space-4);">Couleurs sémantiques</caption>
        <thead>
          <tr style="text-align: start;">
            <th scope="col" style="text-align: start; padding: var(--f-space-2);">Token</th>
            <th scope="col" style="text-align: start; padding: var(--f-space-2);">Aperçu</th>
            <th scope="col" style="text-align: start; padding: var(--f-space-2);">Clair</th>
            <th scope="col" style="text-align: start; padding: var(--f-space-2);">Sombre</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name" style="border-block-start: 1px solid var(--f-color-border-subtle);">
            <td style="padding: var(--f-space-2);"><code>{{ row.name }}</code></td>
            <td style="padding: var(--f-space-2);">
              <span aria-hidden="true" :style="{ display: 'inline-block', inlineSize: '2.5rem', blockSize: '1.5rem', borderRadius: 'var(--f-radius-md)', border: '1px solid var(--f-color-border)', background: 'var(' + row.name + ')' }"></span>
            </td>
            <td style="padding: var(--f-space-2); font-variant-numeric: tabular-nums;">{{ row.light }} · {{ row.onBgLight }}:1</td>
            <td style="padding: var(--f-space-2); font-variant-numeric: tabular-nums;">{{ row.dark }} · {{ row.onBgDark }}:1</td>
          </tr>
        </tbody>
      </table>`
  }),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('table', { name: 'Couleurs sémantiques' })
    ).toBeVisible();
    await expect(canvas.getByText('--f-color-accent')).toBeVisible();
  }
};
