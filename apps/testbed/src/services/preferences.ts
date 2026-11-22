export interface Preferences {
  trackingEmails: boolean;
  newsletter: boolean;
}

const DEFAULTS: Preferences = { trackingEmails: true, newsletter: false };
const key = (email: string) => `folio-testbed:preferences:${email}`;

export function loadPreferences(email: string): Preferences {
  try {
    const raw = sessionStorage.getItem(key(email));
    return raw
      ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) }
      : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Enregistrement simulé (latence), conservé pour l'onglet. */
export async function savePreferences(
  email: string,
  preferences: Preferences
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    sessionStorage.setItem(key(email), JSON.stringify(preferences));
  } catch {
    // Stockage indisponible : les préférences restent en mémoire pour la page.
  }
}
