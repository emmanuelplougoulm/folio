import { ACCOUNTS, DEMO_PASSWORD } from '../mocks/accounts';

export interface User {
  email: string;
  name: string;
}

export type SignInResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'invalid-credentials' | 'account-locked' };

/** Latence simulée, pour rendre visible l'état de chargement. */
const LATENCY_MS = 400;

/** API de connexion fictive : aucune requête réseau. */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  const account = Object.values(ACCOUNTS).find(
    (candidate) => candidate.email === email.trim().toLowerCase()
  );
  if (!account || password !== DEMO_PASSWORD) {
    return { ok: false, reason: 'invalid-credentials' };
  }
  if (account.status === 'locked') return { ok: false, reason: 'account-locked' };
  return { ok: true, user: { email: account.email, name: account.name } };
}
