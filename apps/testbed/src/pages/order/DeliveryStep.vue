<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FButton,
  FErrorSummary,
  FFormField,
  FRadioGroup,
  FSelect,
  FTextArea,
  FTextInput,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { COUNTRIES, DELIVERY_METHODS, PICKUP_POINTS } from '../../order/catalog';
import { draft } from '../../order/draft';
import { formatPrice } from '../../order/format';
import { isEmpty, validateDelivery, type DeliveryField } from '../../order/validation';
import { toSummary } from '../../forms/summary';
import type { Locale } from '../../i18n';

const { t, locale } = useI18n();
const router = useRouter();

const FIELDS: DeliveryField[] = [
  'method',
  'fullName',
  'address',
  'postalCode',
  'city',
  'country',
  'pickupPoint'
];
const INSTRUCTIONS_MAX = 200;

const submitted = ref(false);
const summary = ref<ErrorSummaryItem[]>([]);
const errors = computed(() => (submitted.value ? validateDelivery(draft) : {}));
const message = (field: DeliveryField) => {
  const key = errors.value[field];
  return key ? t(key) : undefined;
};

const methods = computed(() =>
  DELIVERY_METHODS.map((method) => ({
    value: method.id,
    label: t(`order.delivery.methods.${method.id}.name`),
    description: t(`order.delivery.methods.${method.id}.description`)
  }))
);
const feeOf = (id: string) => {
  const fee = DELIVERY_METHODS.find((m) => m.id === id)?.fee ?? 0;
  return fee === 0 ? t('order.free') : formatPrice(fee, locale.value as Locale);
};
const countries = computed(() =>
  COUNTRIES.map((code) => ({ value: code, label: t(`order.countries.${code}`) }))
);
const pickupPoints = PICKUP_POINTS.map((point) => ({
  value: point.id,
  label: point.label
}));
const counter = (length: number, max: number) =>
  t('order.delivery.instructionsCounter', { count: max - length });

async function onSubmit() {
  submitted.value = true;
  summary.value = toSummary(FIELDS, errors.value, t, { method: 'method-0' });
  if (!isEmpty(errors.value)) return;
  await router.push({ name: 'order-review', params: { locale: locale.value } });
}
</script>

<template>
  <section>
    <h1 class="tb-title">{{ t('order.delivery.title') }}</h1>
    <FErrorSummary
      :title="t('order.errorSummary', summary.length)"
      :errors="summary"
      class="tb-order__block"
    />
    <form class="tb-order__form" novalidate @submit.prevent="onSubmit">
      <FRadioGroup
        id="method"
        v-model="draft.method"
        :legend="t('order.delivery.legend')"
        :options="methods"
        :error="message('method')"
        variant="card"
        required
      >
        <template #option="{ option }">
          <span class="tb-order__price">{{ feeOf(option.value) }}</span>
        </template>
      </FRadioGroup>

      <template v-if="draft.method === 'home'">
        <FFormField
          id="fullName"
          :label="t('order.delivery.fullName')"
          :error="message('fullName')"
          required
        >
          <FTextInput v-model="draft.fullName" name="name" autocomplete="shipping name" />
        </FFormField>
        <FFormField
          id="address"
          :label="t('order.delivery.address')"
          :error="message('address')"
          required
        >
          <FTextInput
            v-model="draft.address"
            name="address"
            autocomplete="shipping address-line1"
          />
        </FFormField>
        <div class="tb-order__row">
          <FFormField
            id="postalCode"
            :label="t('order.delivery.postalCode')"
            :error="message('postalCode')"
            required
          >
            <FTextInput
              v-model="draft.postalCode"
              name="postal-code"
              autocomplete="shipping postal-code"
              inputmode="numeric"
            />
          </FFormField>
          <FFormField
            id="city"
            :label="t('order.delivery.city')"
            :error="message('city')"
            required
          >
            <FTextInput
              v-model="draft.city"
              name="city"
              autocomplete="shipping address-level2"
            />
          </FFormField>
        </div>
        <FFormField
          id="country"
          :label="t('order.delivery.country')"
          :error="message('country')"
          required
        >
          <FSelect
            v-model="draft.country"
            :options="countries"
            :placeholder="t('order.delivery.countryPlaceholder')"
            autocomplete="shipping country"
          />
        </FFormField>
        <FFormField
          id="instructions"
          :label="t('order.delivery.instructions')"
          :hint="t('order.delivery.instructionsHint')"
        >
          <FTextArea
            v-model="draft.instructions"
            :maxlength="INSTRUCTIONS_MAX"
            :counter="counter"
          />
        </FFormField>
      </template>

      <FFormField
        v-if="draft.method === 'relay'"
        id="pickupPoint"
        :label="t('order.delivery.pickupPoint')"
        :error="message('pickupPoint')"
        required
      >
        <FSelect
          v-model="draft.pickupPoint"
          :options="pickupPoints"
          :placeholder="t('order.delivery.pickupPointPlaceholder')"
        />
      </FFormField>

      <div class="tb-order__nav">
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-offer', params: { locale } }"
          variant="ghost"
        >
          {{ t('order.back') }}
        </FButton>
        <FButton type="submit" variant="primary" size="lg">{{
          t('order.continue')
        }}</FButton>
      </div>
    </form>
  </section>
</template>
