<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FButton,
  FErrorSummary,
  FRadioGroup,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { OFFERS, type OfferId } from '../../order/catalog';
import { draft } from '../../order/draft';
import { formatPrice } from '../../order/format';
import { isEmpty, validateOffer } from '../../order/validation';
import { toSummary } from '../../forms/summary';
import type { Locale } from '../../i18n';

const { t, locale } = useI18n();
const router = useRouter();

const submitted = ref(false);
const summary = ref<ErrorSummaryItem[]>([]);
const errors = computed(() => (submitted.value ? validateOffer(draft) : {}));

const options = computed(() =>
  OFFERS.map((offer) => ({
    value: offer.id,
    label: t(`order.offers.${offer.id}.name`),
    description: t(`order.offers.${offer.id}.description`)
  }))
);
const priceOf = (id: OfferId) =>
  t('order.perMonth', {
    price: formatPrice(
      OFFERS.find((o) => o.id === id)?.price ?? 0,
      locale.value as Locale
    )
  });

async function onSubmit() {
  submitted.value = true;
  summary.value = toSummary(['offer'], errors.value, t, { offer: 'offer-0' });
  if (!isEmpty(errors.value)) return;
  await router.push({ name: 'order-delivery', params: { locale: locale.value } });
}
</script>

<template>
  <section>
    <h1 class="tb-title">{{ t('order.offer.title') }}</h1>
    <FErrorSummary
      :title="t('order.errorSummary', summary.length)"
      :errors="summary"
      class="tb-order__block"
    />
    <form class="tb-order__form" novalidate @submit.prevent="onSubmit">
      <FRadioGroup
        id="offer"
        v-model="draft.offer"
        :legend="t('order.offer.legend')"
        :options="options"
        :error="errors.offer && t(errors.offer)"
        variant="card"
        required
      >
        <template #option="{ option }">
          <span class="tb-order__price">{{ priceOf(option.value) }}</span>
        </template>
      </FRadioGroup>
      <div class="tb-order__nav">
        <FButton type="submit" variant="primary" size="lg">{{
          t('order.continue')
        }}</FButton>
      </div>
    </form>
  </section>
</template>
