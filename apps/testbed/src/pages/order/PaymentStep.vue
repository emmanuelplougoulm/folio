<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FAlert,
  FButton,
  FDescriptionList,
  FDialog,
  FErrorSummary,
  FFormField,
  FTextInput,
  FTooltip,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { PICKUP_POINTS, offerPrice } from '../../order/catalog';
import { deliveryFeeFor, orderTotal, stepsOf } from '../../order/process';
import { draft, lastOrder, resetDraft } from '../../order/draft';
import { addOrder } from '../../order/history';
import { session } from '../../services/session';
import { appUrl, sendEmail } from '../../services/mailer';
import { validateEmail } from '../../forms/validators';
import { formatPrice } from '../../order/format';
import { CHALLENGE_CODE, TEST_CARDS } from '../../mocks/cards';
import {
  formatCardNumber,
  formatExpiry,
  validateCard,
  type CardField,
  type CardInput
} from '../../payment/card';
import { confirmChallenge, pay } from '../../services/payments';
import { toSummary } from '../../forms/summary';
import type { Locale } from '../../i18n';

const { t, locale } = useI18n();
const router = useRouter();

type Failure =
  'declined' | 'insufficient-funds' | 'challenge-failed' | 'challenge-cancelled';

// Données de carte : état local uniquement, jamais dans le brouillon ni dans sessionStorage.
const card = reactive<CardInput>({ number: '', expiry: '', cvc: '', name: '' });
// v1 : l'adresse de confirmation se saisit ici, pré-remplie si connecté.
// À partir de la v2 (FOL-214), elle vient de l'étape « Coordonnées ».
const askEmail = !stepsOf(draft.processVersion).includes('contact');
const email = ref(askEmail ? (session.user.value?.email ?? '') : draft.email);
const submitted = ref(false);
const pending = ref(false);
const failure = ref<Failure | null>(null);
const summary = ref<ErrorSummaryItem[]>([]);

const challenge = reactive({ open: false, id: '', code: '', error: '', pending: false });

type PaymentField = CardField | 'email';
const FIELDS: PaymentField[] = ['email', 'number', 'expiry', 'cvc', 'name'];
const errors = computed<Partial<Record<PaymentField, string>>>(() => {
  if (!submitted.value) return {};
  const emailError = askEmail ? validateEmail(email.value) : undefined;
  return { ...(emailError ? { email: emailError } : {}), ...validateCard(card) };
});
const message = (field: PaymentField) => {
  const key = errors.value[field];
  return key ? t(key) : undefined;
};

const price = (cents: number) => formatPrice(cents, locale.value as Locale);
const fee = computed(() =>
  draft.method ? deliveryFeeFor(draft.processVersion, draft.method, draft.offer) : 0
);
const total = computed(() => orderTotal(draft));
const amounts = computed(() => [
  {
    term: draft.offer ? t(`order.offers.${draft.offer}.name`) : '',
    details: price(draft.offer ? offerPrice(draft.offer) : 0)
  },
  {
    term: draft.method ? t(`order.delivery.methods.${draft.method}.name`) : '',
    details: fee.value > 0 ? price(fee.value) : t('order.free')
  },
  { term: t('payment.total'), details: price(total.value) }
]);
const testCards = computed(() => [
  { term: t('payment.testCards.success'), details: TEST_CARDS.success },
  { term: t('payment.testCards.challenge'), details: TEST_CARDS.challenge },
  { term: t('payment.testCards.declined'), details: TEST_CARDS.declined },
  {
    term: t('payment.testCards.insufficientFunds'),
    details: TEST_CARDS.insufficientFunds
  }
]);

async function complete(orderNumber: string) {
  lastOrder.value = { number: orderNumber };
  const point = PICKUP_POINTS.find((p) => p.id === draft.pickupPoint);
  sendEmail(email.value.trim(), locale.value as Locale, {
    template: 'order-confirmation',
    data: {
      orderNumber,
      customerName: session.user.value?.name ?? (card.name.trim() || undefined),
      offer: draft.offer ? t(`order.offers.${draft.offer}.name`) : '',
      delivery:
        draft.method === 'relay' && point
          ? `${t('order.delivery.methods.relay.name')} · ${point.name}`
          : draft.method
            ? t(`order.delivery.methods.${draft.method}.name`)
            : '',
      total: total.value,
      placedAt: new Date().toISOString(),
      accountUrl: appUrl(`/${locale.value}/account`)
    }
  });
  if (draft.offer) {
    addOrder({
      number: orderNumber,
      email: session.user.value?.email ?? null,
      placedAt: new Date().toISOString(),
      offer: draft.offer,
      total: total.value,
      status: 'confirmed',
      processVersion: draft.processVersion
    });
  }
  resetDraft();
  await router.push({ name: 'order-confirmation', params: { locale: locale.value } });
}

async function onSubmit() {
  submitted.value = true;
  failure.value = null;
  summary.value = toSummary(FIELDS, errors.value, t, {
    email: 'receiptEmail',
    number: 'cardNumber',
    expiry: 'cardExpiry',
    cvc: 'cardCvc',
    name: 'cardName'
  });
  if (summary.value.length || !draft.reservation) return;

  pending.value = true;
  try {
    const result = await pay(draft.reservation, card);
    if (result.status === 'succeeded') await complete(result.orderNumber);
    else if (result.status === 'failed') failure.value = result.reason;
    else
      Object.assign(challenge, {
        open: true,
        id: result.challengeId,
        code: '',
        error: ''
      });
  } finally {
    pending.value = false;
  }
}

async function onConfirmChallenge() {
  if (!challenge.code.trim()) {
    challenge.error = t('payment.challenge.errors.required');
    return;
  }
  challenge.pending = true;
  try {
    const result = await confirmChallenge(challenge.id, challenge.code);
    if (result.status === 'succeeded') {
      challenge.open = false;
      await complete(result.orderNumber);
    } else if (result.status === 'wrong-code') {
      challenge.error = t('payment.challenge.errors.wrongCode', result.attemptsLeft);
      challenge.code = '';
    } else {
      challenge.open = false;
      failure.value = result.reason;
    }
  } finally {
    challenge.pending = false;
  }
}

function onChallengeDismiss() {
  failure.value = 'challenge-cancelled';
}

function onCancelChallenge() {
  challenge.open = false;
  failure.value = 'challenge-cancelled';
}

const failureMessage = computed(() => {
  switch (failure.value) {
    case 'declined':
      return t('payment.failures.declined');
    case 'insufficient-funds':
      return t('payment.failures.insufficientFunds');
    case 'challenge-failed':
      return t('payment.failures.challengeFailed');
    case 'challenge-cancelled':
      return t('payment.failures.challengeCancelled');
    default:
      return '';
  }
});
</script>

<template>
  <section>
    <h1 class="tb-title">{{ t('payment.title') }}</h1>

    <FDescriptionList :items="amounts" class="tb-order__block" />

    <FErrorSummary
      :title="t('order.errorSummary', summary.length)"
      :errors="summary"
      class="tb-order__block"
    />
    <FAlert
      v-if="failure"
      :tone="failure === 'challenge-cancelled' ? 'warning' : 'danger'"
      live="assertive"
      :title="t('payment.failedTitle')"
      class="tb-order__block"
    >
      {{ failureMessage }}
    </FAlert>

    <form class="tb-order__form" novalidate @submit.prevent="onSubmit">
      <FFormField
        v-if="askEmail"
        id="receiptEmail"
        :label="t('payment.email')"
        :hint="t('payment.emailHint')"
        :error="message('email')"
        required
      >
        <FTextInput
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          spellcheck="false"
        />
      </FFormField>
      <FFormField
        id="cardNumber"
        :label="t('payment.number')"
        :hint="t('payment.numberHint')"
        :error="message('number')"
        required
      >
        <FTextInput
          v-model="card.number"
          name="cc-number"
          autocomplete="cc-number"
          inputmode="numeric"
          spellcheck="false"
          @blur="card.number = formatCardNumber(card.number)"
        />
      </FFormField>
      <div class="tb-payment__row">
        <FFormField
          id="cardExpiry"
          :label="t('payment.expiry')"
          :hint="t('payment.expiryHint')"
          :error="message('expiry')"
          required
        >
          <FTextInput
            v-model="card.expiry"
            name="cc-exp"
            autocomplete="cc-exp"
            inputmode="numeric"
            @blur="card.expiry = formatExpiry(card.expiry)"
          />
        </FFormField>
        <FFormField
          id="cardCvc"
          :label="t('payment.cvc')"
          :hint="t('payment.cvcHint')"
          :error="message('cvc')"
          required
        >
          <FTextInput
            v-model="card.cvc"
            name="cc-csc"
            autocomplete="cc-csc"
            inputmode="numeric"
          />
        </FFormField>
      </div>
      <FFormField
        id="cardName"
        :label="t('payment.name')"
        :error="message('name')"
        required
      >
        <FTextInput v-model="card.name" name="cc-name" autocomplete="cc-name" />
      </FFormField>

      <div class="tb-order__nav">
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-review', params: { locale } }"
          variant="ghost"
        >
          {{ t('order.back') }}
        </FButton>
        <div class="tb-payment__submit">
          <FTooltip :content="t('payment.security.tooltip')">
            <button
              type="button"
              class="tb-payment__security"
              :aria-label="t('payment.security.label')"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm-2 3.5a2 2 0 1 1 4 0V6H6V4.5Z"
                />
              </svg>
            </button>
          </FTooltip>
          <FButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="pending"
            :loading-label="t('payment.submitting')"
          >
            {{ t('payment.submit', { amount: price(total) }) }}
          </FButton>
        </div>
      </div>
    </form>

    <FAlert :title="t('payment.testCards.title')" class="tb-order__block">
      <p class="tb-payment__note">{{ t('payment.testCards.intro') }}</p>
      <FDescriptionList :items="testCards" layout="stacked">
        <template #details="{ item }"
          ><code class="tb-code">{{ item.details }}</code></template
        >
      </FDescriptionList>
    </FAlert>

    <FDialog
      v-model:open="challenge.open"
      :title="t('payment.challenge.title')"
      :description="t('payment.challenge.description', { code: CHALLENGE_CODE })"
      :close-label="t('payment.challenge.close')"
      :dismissible="!challenge.pending"
      @dismiss="onChallengeDismiss"
    >
      <form id="challenge-form" novalidate @submit.prevent="onConfirmChallenge">
        <FFormField
          id="challengeCode"
          :label="t('payment.challenge.code')"
          :error="challenge.error || undefined"
          required
        >
          <FTextInput
            v-model="challenge.code"
            name="one-time-code"
            autocomplete="one-time-code"
            inputmode="numeric"
          />
        </FFormField>
      </form>
      <template #footer>
        <FButton :disabled="challenge.pending" @click="onCancelChallenge">{{
          t('payment.challenge.cancel')
        }}</FButton>
        <FButton
          type="submit"
          form="challenge-form"
          variant="primary"
          :loading="challenge.pending"
          :loading-label="t('payment.challenge.verifying')"
        >
          {{ t('payment.challenge.confirm') }}
        </FButton>
      </template>
    </FDialog>
  </section>
</template>

<style>
.tb-payment__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--f-space-4);
}

.tb-payment__submit {
  display: flex;
  gap: var(--f-space-3);
  align-items: center;
}

.tb-payment__security {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  padding: 0;
  color: var(--f-color-text-muted);
  cursor: help;
  background: transparent;
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-full);
}

.tb-payment__security > svg {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentcolor;
}

.tb-payment__security:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.tb-payment__note {
  margin: 0 0 var(--f-space-2);
}
</style>
