import { inject, type InjectionKey } from 'vue';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Durée d'affichage en millisecondes. Mise en pause au survol, au focus et quand la fenêtre perd le focus. */
  duration?: number;
}

export interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'tone'>> {
  id: number;
  description?: string;
  duration?: number;
  open: boolean;
}

export interface ToastApi {
  /** Affiche une notification et renvoie son identifiant. */
  show(options: ToastOptions): number;
  dismiss(id: number): void;
}

export const toastKey: InjectionKey<ToastApi> = Symbol('FToastProvider');

/** API des notifications. Exige un FToastProvider parmi les ancêtres. */
export function useToast(): ToastApi {
  const api = inject(toastKey, null);
  if (!api) throw new Error('useToast() exige un <FToastProvider> parmi les ancêtres.');
  return api;
}
