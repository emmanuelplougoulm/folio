import tokens from '@emmanuelplougoulm/folio/tokens/light.json';
import type { EmailLocale } from './i18n';
import { MESSAGES } from './i18n';

/**
 * Couleurs Folio (thème clair) : les clients de messagerie ignorent les variables CSS,
 * les valeurs sont donc injectées en ligne depuis les tokens générés.
 */
export const COLORS = {
  bg: tokens.ColorBg,
  surface: tokens.ColorSurface,
  text: tokens.ColorText,
  muted: tokens.ColorTextMuted,
  border: tokens.ColorBorderSubtle,
  accent: tokens.ColorAccent,
  onAccent: tokens.ColorOnAccent,
  warning: tokens.ColorWarning,
  warningBg: tokens.ColorWarningSubtle
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/** Échappe une donnée avant de l'insérer dans le HTML (nom de client, adresse…). */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

export const paragraph = (html: string, style = ''): string =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.5;color:${COLORS.text};${style}">${html}</p>`;

export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:4px;background:${COLORS.accent};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;font-family:${SANS};font-size:16px;font-weight:600;color:${COLORS.onAccent};text-decoration:none;border-radius:4px;">${escapeHtml(label)}</a></td></tr></table>`;
}

/** Tableau de récapitulatif : en-têtes de ligne (th scope=row) pour les lecteurs d'écran. */
export function summaryTable(caption: string, rows: readonly [string, string][]): string {
  const body = rows
    .map(
      ([term, value], index) =>
        `<tr><th scope="row" style="padding:10px 0;font-family:${SANS};font-size:15px;font-weight:400;color:${COLORS.muted};text-align:left;${index ? `border-top:1px solid ${COLORS.border};` : ''}">${escapeHtml(term)}</th><td style="padding:10px 0;font-family:${SANS};font-size:15px;font-weight:600;color:${COLORS.text};text-align:right;${index ? `border-top:1px solid ${COLORS.border};` : ''}">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  return `<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;border-collapse:collapse;"><caption style="padding:0 0 8px;font-family:${SERIF};font-size:18px;color:${COLORS.text};text-align:left;">${escapeHtml(caption)}</caption>${body}</table>`;
}

export interface LayoutOptions {
  locale: EmailLocale;
  subject: string;
  preheader: string;
  title: string;
  body: string;
}

/** Gabarit commun : tables de présentation, styles en ligne, langue déclarée, pré-en-tête masqué. */
export function renderLayout({
  locale,
  subject,
  preheader,
  title,
  body
}: LayoutOptions): string {
  const common = MESSAGES[locale].common;
  return `<!doctype html>
<html lang="${locale}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${COLORS.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
<tr><td style="padding:0 0 16px;font-family:${SERIF};font-size:18px;color:${COLORS.text};">${escapeHtml(common.brand)}</td></tr>
<tr><td style="padding:32px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:8px;">
<h1 style="margin:0 0 24px;font-family:${SERIF};font-size:28px;font-weight:500;line-height:1.2;color:${COLORS.text};">${escapeHtml(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${COLORS.muted};">${escapeHtml(common.footer)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
