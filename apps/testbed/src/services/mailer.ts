import { ref, watch } from 'vue';
import { renderEmail, type EmailLocale, type EmailRequest } from '@folio/emails';

export interface SentEmail {
  id: string;
  to: string;
  locale: EmailLocale;
  template: EmailRequest['template'];
  subject: string;
  preheader: string;
  html: string;
  text: string;
  sentAt: string;
}

const STORAGE_KEY = 'folio-testbed:outbox';

function restore(): SentEmail[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SentEmail[]) : [];
  } catch {
    return [];
  }
}

/** Boîte d'envoi simulée : rien ne part vraiment, tout est consultable sur /:locale/outbox. */
export const outbox = ref<SentEmail[]>(restore());

watch(
  outbox,
  (value) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Stockage indisponible : la boîte reste en mémoire.
    }
  },
  { deep: true }
);

export function sendEmail(
  to: string,
  locale: EmailLocale,
  request: EmailRequest
): SentEmail {
  const email: SentEmail = {
    id: `mail-${String(Date.now())}-${String(outbox.value.length)}`,
    to,
    locale,
    template: request.template,
    sentAt: new Date().toISOString(),
    ...renderEmail(locale, request)
  };
  outbox.value.unshift(email);
  return email;
}

export function clearOutbox() {
  outbox.value = [];
}

/** URL absolue d'une page de l'app, pour les liens des e-mails. */
export const appUrl = (path: string): string =>
  new URL(
    `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`,
    window.location.origin
  ).toString();
