import { readonly, ref } from 'vue';
import type { User } from './auth';

const STORAGE_KEY = 'folio-testbed:user';

function restore(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const user = ref<User | null>(restore());

/** Session en mémoire, conservée pour l'onglet (sessionStorage). */
export const session = {
  user: readonly(user),
  start(next: User) {
    user.value = next;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible (navigation privée) : la session reste en mémoire.
    }
  },
  end() {
    user.value = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Rien à nettoyer.
    }
  }
};
