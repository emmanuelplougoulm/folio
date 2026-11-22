import { ref, watch } from 'vue';
import {
  DELIVERY_METHODS,
  offerPrice,
  type DeliveryMethod,
  type OfferId
} from './catalog';
import type { OrderStep } from './steps';

/**
 * Versions du processus de commande.
 *
 * Une commande garde la version avec laquelle elle a été commencée, même si la version par
 * défaut change entre-temps. Chaque changement renvoie au ticket qui l'a introduit : c'est
 * la source de traçabilité entre exigences, code et tests.
 */
export const PROCESS_VERSIONS = ['v1', 'v2'] as const;
export type ProcessVersion = (typeof PROCESS_VERSIONS)[number];

export const LATEST_VERSION: ProcessVersion = 'v2';
/** Version des brouillons enregistrés avant l'existence des versions. */
export const LEGACY_VERSION: ProcessVersion = 'v1';

export interface ProcessChange {
  /** Ticket fictif à l'origine du changement. */
  ticket: string;
  /** Clé i18n du descriptif, sous `process.changes`. */
  key: string;
}

export interface ProcessDefinition {
  releasedOn: string;
  steps: readonly OrderStep[];
  /** Montant de l'offre (centimes) à partir duquel la livraison à domicile est offerte. */
  freeHomeDeliveryFrom: number | null;
  changes: readonly ProcessChange[];
}

export const PROCESS: Record<ProcessVersion, ProcessDefinition> = {
  v1: {
    releasedOn: '2025-09-15',
    steps: ['offer', 'delivery', 'review', 'payment'],
    freeHomeDeliveryFrom: null,
    changes: [
      { ticket: 'FOL-101', key: 'tunnel' },
      { ticket: 'FOL-118', key: 'pickupPoints' }
    ]
  },
  v2: {
    releasedOn: '2026-11-16',
    steps: ['offer', 'delivery', 'contact', 'review', 'payment'],
    freeHomeDeliveryFrom: 3000,
    changes: [
      { ticket: 'FOL-214', key: 'contactStep' },
      { ticket: 'FOL-221', key: 'freeDelivery' }
    ]
  }
};

export const isProcessVersion = (value: unknown): value is ProcessVersion =>
  typeof value === 'string' && (PROCESS_VERSIONS as readonly string[]).includes(value);

export const stepsOf = (version: ProcessVersion): readonly OrderStep[] =>
  PROCESS[version].steps;

/** Étape suivante dans la version, ou undefined après la dernière. */
export function stepAfter(
  version: ProcessVersion,
  step: OrderStep
): OrderStep | undefined {
  const steps = stepsOf(version);
  return steps[steps.indexOf(step) + 1];
}

/** Étape précédente dans la version, ou undefined avant la première. */
export function stepBefore(
  version: ProcessVersion,
  step: OrderStep
): OrderStep | undefined {
  const steps = stepsOf(version);
  const index = steps.indexOf(step);
  return index > 0 ? steps[index - 1] : undefined;
}

/** Frais de livraison selon la version : la v2 offre le domicile au-delà d'un seuil. */
export function deliveryFeeFor(
  version: ProcessVersion,
  method: DeliveryMethod,
  offer: OfferId | undefined
): number {
  const fee = DELIVERY_METHODS.find((m) => m.id === method)?.fee ?? 0;
  const threshold = PROCESS[version].freeHomeDeliveryFrom;
  if (
    method === 'home' &&
    threshold !== null &&
    offer &&
    offerPrice(offer) >= threshold
  ) {
    return 0;
  }
  return fee;
}

export function orderTotal(order: {
  processVersion: ProcessVersion;
  offer: OfferId | undefined;
  method: DeliveryMethod | undefined;
}): number {
  const offer = order.offer ? offerPrice(order.offer) : 0;
  const fee = order.method
    ? deliveryFeeFor(order.processVersion, order.method, order.offer)
    : 0;
  return offer + fee;
}

const STORAGE_KEY = 'folio-testbed:process-version';

function restoreDefault(): ProcessVersion {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return isProcessVersion(raw) ? raw : LATEST_VERSION;
  } catch {
    return LATEST_VERSION;
  }
}

/** Version appliquée aux nouvelles commandes (réglage de démo, conservé pour l'onglet). */
export const defaultVersion = ref<ProcessVersion>(restoreDefault());

watch(defaultVersion, (value) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Stockage indisponible : le réglage reste en mémoire.
  }
});
