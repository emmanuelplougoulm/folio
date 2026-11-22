<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FButton,
  FErrorSummary,
  FFormField,
  FTextInput,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { draft } from '../../order/draft';
import { isEmpty, validateContact, type ContactField } from '../../order/validation';
import { session } from '../../services/session';
import { toSummary } from '../../forms/summary';

// Étape introduite par la v2 du processus (FOL-214) : l'e-mail quitte la page de paiement.
const { t, locale } = useI18n();
const router = useRouter();

const FIELDS: ContactField[] = ['email', 'phone'];

const submitted = ref(false);
const summary = ref<ErrorSummaryItem[]>([]);
const errors = computed(() => (submitted.value ? validateContact(draft) : {}));
const message = (field: ContactField) => {
  const key = errors.value[field];
  return key ? t(key) : undefined;
};

onMounted(() => {
  if (!draft.email && session.user.value) draft.email = session.user.value.email;
});

async function onSubmit() {
  submitted.value = true;
  summary.value = toSummary(FIELDS, errors.value, t, {
    email: 'contactEmail',
    phone: 'contactPhone'
  });
  if (!isEmpty(errors.value)) return;
  await router.push({ name: 'order-review', params: { locale: locale.value } });
}
</script>

<template>
  <section>
    <h1 class="tb-title">{{ t('order.contact.title') }}</h1>
    <FErrorSummary
      :title="t('order.errorSummary', summary.length)"
      :errors="summary"
      class="tb-order__block"
    />
    <form class="tb-order__form" novalidate @submit.prevent="onSubmit">
      <FFormField
        id="contactEmail"
        :label="t('order.contact.email')"
        :hint="t('order.contact.emailHint')"
        :error="message('email')"
        required
      >
        <FTextInput
          v-model="draft.email"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          spellcheck="false"
        />
      </FFormField>
      <FFormField
        id="contactPhone"
        :label="t('order.contact.phone')"
        :hint="t('order.contact.phoneHint')"
        :error="message('phone')"
      >
        <FTextInput
          v-model="draft.phone"
          type="tel"
          name="tel"
          autocomplete="tel"
          inputmode="tel"
        />
      </FFormField>
      <div class="tb-order__nav">
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-delivery', params: { locale } }"
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
