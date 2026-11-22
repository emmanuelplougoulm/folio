import { reactive, ref, watch } from 'vue';
import type { Country, DeliveryMethod, OfferId, PickupPointId } from './catalog';

export interface OrderDraft {
  offer: OfferId | undefined;
  method: DeliveryMethod | undefined;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
  country: Country | '';
  pickupPoint: PickupPointId | '';
  instructions: string;
}

export interface PlacedOrder {
  number: string;
  email?: string;
}

const STORAGE_KEY = 'folio-testbed:order';

const empty = (): OrderDraft => ({
  offer: undefined,
  method: undefined,
  fullName: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  pickupPoint: '',
  instructions: ''
});

function restore(): OrderDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty(), ...(JSON.parse(raw) as Partial<OrderDraft>) } : empty();
  } catch {
    return empty();
  }
}

/** Brouillon de commande, conservé pour l'onglet : un rechargement ne perd pas la saisie. */
export const draft = reactive<OrderDraft>(restore());

watch(draft, (value) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Stockage indisponible : le brouillon reste en mémoire.
  }
});

export const lastOrder = ref<PlacedOrder | null>(null);

export function resetDraft() {
  Object.assign(draft, empty());
}
