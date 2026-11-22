import { reactive, ref, watch } from 'vue';
import type { Country, DeliveryMethod, OfferId } from './catalog';
import {
  LEGACY_VERSION,
  defaultVersion,
  isProcessVersion,
  type ProcessVersion
} from './process';

export interface OrderDraft {
  /** Version du processus, figée à la création du brouillon. */
  processVersion: ProcessVersion;
  offer: OfferId | undefined;
  method: DeliveryMethod | undefined;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
  country: Country | '';
  /** Identifiant d'un point de PICKUP_POINTS, ou vide. */
  pickupPoint: string;
  instructions: string;
  /** Coordonnées (étape « contact », à partir de la v2). */
  email: string;
  phone: string;
  acceptedTerms: boolean;
  /** Réservation obtenue en validant le récapitulatif : elle ouvre l'étape de paiement. */
  reservation: string | null;
}

export interface PlacedOrder {
  number: string;
  email?: string;
}

const STORAGE_KEY = 'folio-testbed:order';

const empty = (): OrderDraft => ({
  processVersion: defaultVersion.value,
  offer: undefined,
  method: undefined,
  fullName: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  pickupPoint: '',
  instructions: '',
  email: '',
  phone: '',
  acceptedTerms: false,
  reservation: null
});

/**
 * Relit un brouillon enregistré. Un brouillon sans version date d'avant les versions :
 * il continue en v1, le processus avec lequel il a été commencé.
 */
export function parseDraft(raw: string | null): OrderDraft {
  if (!raw) return empty();
  try {
    const saved = JSON.parse(raw) as Partial<OrderDraft>;
    return {
      ...empty(),
      ...saved,
      processVersion: isProcessVersion(saved.processVersion)
        ? saved.processVersion
        : LEGACY_VERSION
    };
  } catch {
    return empty();
  }
}

function restore(): OrderDraft {
  try {
    return parseDraft(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return empty();
  }
}

/**
 * Brouillon de commande, conservé pour l'onglet : un rechargement ne perd pas la saisie.
 * Les données de carte n'y figurent jamais : elles restent dans l'état local de l'étape paiement.
 */
export const draft = reactive<OrderDraft>(restore());

watch(draft, (value) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Stockage indisponible : le brouillon reste en mémoire.
  }
});

export const lastOrder = ref<PlacedOrder | null>(null);

/** Nouveau brouillon, dans la version par défaut du moment. */
export function resetDraft() {
  Object.assign(draft, empty());
}

/** Un brouillon sans offre n'a rien commencé : on peut encore en changer la version. */
export const isPristine = (d: OrderDraft): boolean => !d.offer;
