import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Fondations/Typographie',
  parameters: { layout: 'padded' },
  tags: ['!autodocs']
} satisfies Meta;

export default meta;

const sizes = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

/** Source Serif 4 pour les titres, Source Sans 3 pour le texte, avec des chiffres tabulaires pour les montants. */
export const Typographie: StoryObj = {
  render: () => ({
    setup: () => ({ sizes }),
    template: `
      <div style="display: grid; gap: var(--f-space-6);">
        <section>
          <h2 style="font-family: var(--f-font-family-serif); font-weight: var(--f-font-weight-medium); font-size: var(--f-font-size-2xl); line-height: var(--f-font-line-height-tight); margin: 0;">Récapitulatif de la commande</h2>
          <p style="color: var(--f-color-text-muted); margin: var(--f-space-2) 0 0;">Étape 2 sur 3 · Livraison · Envío · Shipping</p>
        </section>
        <section>
          <p v-for="size in sizes" :key="size" :style="{ fontSize: 'var(--f-font-size-' + size + ')', margin: 0, lineHeight: 'var(--f-font-line-height-snug)' }">
            <code>{{ size }}</code> Él pagó 129,00 € à l'hôtel — Ñandú, çà, œuvre, ¿qué?
          </p>
        </section>
        <section style="font-variant-numeric: tabular-nums;">
          <p style="margin: 0;">Sous-total 1 129,00 €</p>
          <p style="margin: 0;">Livraison &nbsp;&nbsp;&nbsp;&nbsp;11,90 €</p>
          <p style="margin: 0; font-weight: var(--f-font-weight-semibold);">Total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1 140,90 €</p>
        </section>
      </div>`
  }),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Récapitulatif de la commande' })
    ).toBeVisible();
  }
};
