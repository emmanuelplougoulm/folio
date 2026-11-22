import {
  MESSAGES,
  colon,
  formatDate,
  formatPrice,
  interpolate,
  type EmailLocale
} from '../i18n';
import { button, escapeHtml, paragraph, renderLayout, summaryTable } from '../layout';
import type { RenderedEmail } from '../types';

export interface OrderConfirmationData {
  orderNumber: string;
  customerName?: string;
  offer: string;
  delivery: string;
  /** Montant en centimes. */
  total: number;
  placedAt: string;
  accountUrl: string;
}

export function orderConfirmation(
  locale: EmailLocale,
  data: OrderConfirmationData
): RenderedEmail {
  const m = MESSAGES[locale];
  const t = m.orderConfirmation;
  const subject = interpolate(t.subject, { number: data.orderNumber });
  const greeting = data.customerName
    ? interpolate(m.common.greeting, { name: data.customerName })
    : m.common.greetingAnonymous;
  const intro = interpolate(t.intro, { number: data.orderNumber });
  const rows: [string, string][] = [
    [t.offer, data.offer],
    [t.delivery, data.delivery],
    [t.date, formatDate(data.placedAt, locale)],
    [t.total, formatPrice(data.total, locale)]
  ];

  const html = renderLayout({
    locale,
    subject,
    preheader: t.preheader,
    title: t.title,
    body: [
      paragraph(escapeHtml(greeting)),
      paragraph(escapeHtml(intro)),
      summaryTable(t.summary, rows),
      button(t.cta, data.accountUrl)
    ].join('\n')
  });

  const text = [
    greeting,
    '',
    intro,
    '',
    t.summary,
    ...rows.map(([term, value]) => `- ${term}${colon(locale)}${value}`),
    '',
    `${t.cta}${colon(locale)}${data.accountUrl}`,
    '',
    '--',
    m.common.footer
  ].join('\n');

  return { subject, preheader: t.preheader, html, text };
}
