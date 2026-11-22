import { describe, expect, it } from 'vitest';
import { renderEmail, type EmailLocale, type EmailRequest } from './index';
import { MESSAGES, interpolate } from './i18n';
import { escapeHtml } from './layout';

const LOCALES: EmailLocale[] = ['fr', 'en', 'es'];

const order: EmailRequest = {
  template: 'order-confirmation',
  data: {
    orderNumber: 'FO-123456',
    customerName: 'Ana <Demo>',
    offer: 'Plus',
    delivery: 'Retrait en point relais',
    total: 2480,
    placedAt: '2026-11-22T10:30:00.000Z',
    accountUrl: 'https://testbed.local/fr/account'
  }
};
const signIn: EmailRequest = {
  template: 'sign-in-alert',
  data: {
    name: 'Ana',
    signedInAt: '2026-11-22T10:30:00.000Z',
    accountUrl: 'https://testbed.local/fr/account'
  }
};

const keysOf = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keysOf(child as object, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

describe('textes des e-mails', () => {
  it('les trois langues ont exactement les mêmes clés', () => {
    const reference = keysOf(MESSAGES.fr).sort();
    expect(keysOf(MESSAGES.en).sort()).toEqual(reference);
    expect(keysOf(MESSAGES.es).sort()).toEqual(reference);
  });

  it('une variable manquante lève une erreur plutôt que d’envoyer « {name} »', () => {
    expect(() => interpolate('Bonjour {name}')).toThrow(/\{name\}/);
  });
});

describe.each(LOCALES)('e-mails en %s', (locale) => {
  for (const request of [order, signIn]) {
    describe(request.template, () => {
      const email = renderEmail(locale, request);

      it('déclare la langue, un titre et un pré-en-tête', () => {
        expect(email.html).toContain(`<html lang="${locale}" dir="ltr">`);
        expect(email.html).toContain(`<title>${escapeHtml(email.subject)}</title>`);
        expect(email.html).toContain(escapeHtml(email.preheader));
      });

      it('n’a aucune variable non remplacée, en HTML comme en texte', () => {
        expect(email.html).not.toMatch(/\{\w+\}/);
        expect(email.text).not.toMatch(/\{\w+\}/);
      });

      it('les tables de mise en page sont marquées role=presentation', () => {
        const tables = email.html.match(/<table[^>]*>/g) ?? [];
        const layout = tables.filter((tag) => !tag.includes('border-collapse'));
        expect(layout.length).toBeGreaterThan(0);
        for (const tag of layout) expect(tag).toContain('role="presentation"');
      });

      it('fournit une version texte qui reprend le lien d’action', () => {
        expect(email.text).toContain('https://testbed.local/fr/account');
        // Aucune balise de mise en page (le nom du client, lui, peut contenir « < »).
        expect(email.text).not.toMatch(/<(p|table|td|a|h1|div)[\s>]/);
      });
    });
  }
});

describe('confirmation de commande', () => {
  it('objet, montant et date localisés', () => {
    expect(renderEmail('fr', order).subject).toBe('Commande FO-123456 confirmée');
    expect(renderEmail('es', order).subject).toBe('Pedido FO-123456 confirmado');
    expect(renderEmail('en', order).text).toContain('Total paid: €24.80');
    expect(renderEmail('fr', order).text).toContain('Total payé : 24,80 €');
    expect(renderEmail('es', order).html).toContain('22 de noviembre de 2026');
  });

  it('échappe les données du client', () => {
    const { html } = renderEmail('fr', order);
    expect(html).toContain('Bonjour Ana &lt;Demo&gt;,');
    expect(html).not.toContain('<Demo>');
  });

  it('salutation neutre sans nom', () => {
    const anonymous = renderEmail('es', {
      ...order,
      data: { ...order.data, customerName: undefined }
    });
    expect(anonymous.text.startsWith('Hola:')).toBe(true);
  });

  it('récapitulatif en tableau de données, en-têtes de ligne', () => {
    const { html } = renderEmail('fr', order);
    expect(html).toContain('<caption');
    expect(html.match(/<th scope="row"/g)).toHaveLength(4);
  });
});

describe('alerte de connexion', () => {
  it('date et heure de Paris, localisées', () => {
    expect(renderEmail('fr', signIn).text).toContain('22 novembre 2026 à 11:30');
    expect(renderEmail('en', signIn).subject).toBe('New sign-in to your account');
  });
});
