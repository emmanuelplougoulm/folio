import { MESSAGES, colon, formatDateTime, interpolate, type EmailLocale } from '../i18n';
import { COLORS, button, escapeHtml, paragraph, renderLayout } from '../layout';
import type { RenderedEmail } from '../types';

export interface SignInAlertData {
  name: string;
  signedInAt: string;
  accountUrl: string;
}

export function signInAlert(locale: EmailLocale, data: SignInAlertData): RenderedEmail {
  const m = MESSAGES[locale];
  const t = m.signInAlert;
  const greeting = interpolate(m.common.greeting, { name: data.name });
  const intro = interpolate(t.intro, { date: formatDateTime(data.signedInAt, locale) });

  const html = renderLayout({
    locale,
    subject: t.subject,
    preheader: t.preheader,
    title: t.title,
    body: [
      paragraph(escapeHtml(greeting)),
      paragraph(escapeHtml(intro)),
      // Avertissement : bordure et texte, pas seulement une couleur de fond.
      paragraph(
        escapeHtml(t.warning),
        `padding:12px 16px;background:${COLORS.warningBg};border-left:4px solid ${COLORS.warning};font-weight:600;`
      ),
      button(t.cta, data.accountUrl)
    ].join('\n')
  });

  const text = [
    greeting,
    '',
    intro,
    '',
    t.warning,
    '',
    `${t.cta}${colon(locale)}${data.accountUrl}`,
    '',
    '--',
    m.common.footer
  ].join('\n');

  return { subject: t.subject, preheader: t.preheader, html, text };
}
