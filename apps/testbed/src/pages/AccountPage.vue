<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FBadge,
  FButton,
  FCard,
  FDescriptionList,
  FEmptyState,
  useToast,
  type BadgeTone
} from '@emmanuelplougoulm/folio';
import { session } from '../services/session';
import { useOrdersOf, type OrderStatus, type StoredOrder } from '../order/history';
import { formatPrice } from '../order/format';
import type { Locale } from '../i18n';

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();

const orders = useOrdersOf(() => session.user.value?.email);

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  confirmed: 'info',
  preparing: 'neutral',
  delivered: 'success',
  cancelled: 'danger'
};

const TAGS: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(TAGS[locale.value as Locale], { dateStyle: 'long' }).format(
    new Date(iso)
  );

const detailsOf = (order: StoredOrder) => [
  { term: t('account.orders.date'), details: formatDate(order.placedAt) },
  { term: t('account.orders.offer'), details: t(`order.offers.${order.offer}.name`) },
  {
    term: t('account.orders.total'),
    details: formatPrice(order.total, locale.value as Locale)
  }
];

async function signOut() {
  session.end();
  toast.show({ title: t('toasts.signedOut.title'), tone: 'info' });
  await router.push({ name: 'home', params: { locale: locale.value } });
}
</script>

<template>
  <h1 class="tb-title">{{ t('account.title') }}</h1>
  <p v-if="session.user.value" class="tb-lead">
    {{
      t('account.welcome', {
        name: session.user.value.name,
        email: session.user.value.email
      })
    }}
  </p>

  <section class="tb-account__orders" aria-labelledby="orders-title">
    <h2 id="orders-title" class="tb-account__title">{{ t('account.orders.title') }}</h2>
    <ul v-if="orders.length" class="tb-account__list">
      <li v-for="order in orders" :key="order.number">
        <FCard
          as="article"
          :title="t('account.orders.number', { number: order.number })"
          :heading-level="3"
        >
          <template #headerAction>
            <FBadge :tone="STATUS_TONE[order.status]">{{
              t(`account.status.${order.status}`)
            }}</FBadge>
          </template>
          <FDescriptionList :items="detailsOf(order)" />
        </FCard>
      </li>
    </ul>
    <FEmptyState
      v-else
      :title="t('account.orders.emptyTitle')"
      :description="t('account.orders.emptyBody')"
      :heading-level="3"
    >
      <template #illustration>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 7h16l-1.5 12h-13L4 7Zm4 0a4 4 0 0 1 8 0" />
        </svg>
      </template>
      <template #actions>
        <FButton
          :as="RouterLink"
          :to="{ name: 'order-offer', params: { locale } }"
          variant="primary"
        >
          {{ t('home.ctaOrder') }}
        </FButton>
      </template>
    </FEmptyState>
  </section>

  <p class="tb-actions">
    <FButton @click="signOut">{{ t('account.signOut') }}</FButton>
  </p>
</template>

<style>
.tb-account__orders {
  margin-block-start: var(--f-space-10);
}

.tb-account__title {
  margin: 0 0 var(--f-space-4);
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-2xl);
  font-weight: var(--f-font-weight-medium);
}

.tb-account__list {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-4);
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>
