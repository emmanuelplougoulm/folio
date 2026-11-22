<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FAlert,
  FButton,
  FCard,
  FCheckbox,
  FErrorSummary,
  FVisuallyHidden,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { PICKUP_POINTS, deliveryFee, offerPrice } from '../../order/catalog';
import { draft } from '../../order/draft';
import { formatPrice } from '../../order/format';
import { reserveOrder } from '../../services/orders';
import type { Locale } from '../../i18n';

const { t, locale } = useI18n();
const router = useRouter();

const submitted = ref(false);
const pending = ref(false);
const failure = ref<'pickup-point-unavailable' | null>(null);
const summary = ref<ErrorSummaryItem[]>([]);

const termsError = computed(() =>
  submitted.value && !draft.acceptedTerms ? t('order.errors.terms') : undefined
);
const price = (cents: number) => formatPrice(cents, locale.value as Locale);
const offer = computed(() => (draft.offer ? offerPrice(draft.offer) : 0));
const fee = computed(() => (draft.method ? deliveryFee(draft.method) : 0));
const pickupLabel = computed(() => {
  const point = PICKUP_POINTS.find((p) => p.id === draft.pickupPoint);
  return point ? `${point.name}, ${point.address}` : '';
});

// Revenir au récapitulatif invalide la réservation : la livraison a pu changer.
onMounted(() => {
  draft.reservation = null;
});

async function onSubmit() {
  submitted.value = true;
  failure.value = null;
  summary.value = termsError.value ? [{ id: 'terms', message: termsError.value }] : [];
  if (summary.value.length) return;

  pending.value = true;
  try {
    const result = await reserveOrder(draft);
    if (!result.ok) {
      failure.value = result.reason;
      return;
    }
    draft.reservation = result.reservation;
    await router.push({ name: 'order-payment', params: { locale: locale.value } });
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section>
    <h1 class="tb-title">{{ t('order.review.title') }}</h1>
    <FErrorSummary
      :title="t('order.errorSummary', summary.length)"
      :errors="summary"
      class="tb-order__block"
    />
    <FAlert
      v-if="failure"
      tone="danger"
      live="assertive"
      :title="t('order.review.failedTitle')"
      class="tb-order__block"
    >
      {{ t('order.review.pickupUnavailable') }}
      <template #actions>
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-delivery', params: { locale } }"
          size="sm"
        >
          {{ t('order.review.changeDelivery') }}
        </FButton>
      </template>
    </FAlert>

    <form class="tb-order__form" novalidate @submit.prevent="onSubmit">
      <FCard :title="t('order.steps.offer')">
        <template #headerAction>
          <RouterLink :to="{ name: 'order-offer', params: { locale } }">
            {{ t('order.review.edit')
            }}<FVisuallyHidden> · {{ t('order.steps.offer') }}</FVisuallyHidden>
          </RouterLink>
        </template>
        <p class="tb-order__nav">
          <span>{{ draft.offer && t(`order.offers.${draft.offer}.name`) }}</span>
          <span class="tb-order__price">{{
            t('order.perMonth', { price: price(offer) })
          }}</span>
        </p>
      </FCard>

      <FCard :title="t('order.steps.delivery')">
        <template #headerAction>
          <RouterLink :to="{ name: 'order-delivery', params: { locale } }">
            {{ t('order.review.edit')
            }}<FVisuallyHidden> · {{ t('order.steps.delivery') }}</FVisuallyHidden>
          </RouterLink>
        </template>
        <p class="tb-order__nav">
          <span>{{
            draft.method && t(`order.delivery.methods.${draft.method}.name`)
          }}</span>
          <span class="tb-order__price">{{
            fee === 0 ? t('order.free') : price(fee)
          }}</span>
        </p>
        <address v-if="draft.method === 'home'" class="tb-order__address">
          {{ draft.fullName }}<br />{{ draft.address }}<br />{{ draft.postalCode }}
          {{ draft.city }}<br />{{
            draft.country && t(`order.countries.${draft.country}`)
          }}
        </address>
        <p v-else>{{ pickupLabel }}</p>
        <template v-if="draft.method === 'home' && draft.instructions" #footer>
          {{ draft.instructions }}
        </template>
      </FCard>

      <p class="tb-order__nav tb-order__total">
        <span>{{ t('order.review.total') }}</span>
        <span class="tb-order__price">{{ price(offer + fee) }}</span>
      </p>

      <FCheckbox
        id="terms"
        v-model="draft.acceptedTerms"
        :label="t('order.review.terms')"
        :error="termsError"
        required
      />

      <div class="tb-order__nav">
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-delivery', params: { locale } }"
          variant="ghost"
        >
          {{ t('order.back') }}
        </FButton>
        <FButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="pending"
          :loading-label="t('order.review.submitting')"
        >
          {{ t('order.review.submit') }}
        </FButton>
      </div>
    </form>
  </section>
</template>

<style>
.tb-order__address {
  font-style: normal;
}

.tb-order__total {
  padding-block-start: var(--f-space-4);
  margin: 0;
  font-size: var(--f-font-size-lg);
  border-block-start: var(--f-border-width-thick) solid var(--f-color-text);
}
</style>
