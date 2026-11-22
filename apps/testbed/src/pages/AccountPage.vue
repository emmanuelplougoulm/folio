<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FBadge,
  FButton,
  FEmptyState,
  FPagination,
  FSwitch,
  FTable,
  FTabs,
  useToast,
  type BadgeTone,
  type TableColumn
} from '@emmanuelplougoulm/folio';
import { session } from '../services/session';
import { loadPreferences, savePreferences } from '../services/preferences';
import { useOrdersOf, type OrderStatus } from '../order/history';
import { formatPrice } from '../order/format';
import type { Locale } from '../i18n';

const PAGE_SIZE = 5;
const TABS = ['orders', 'preferences'] as const;
type Tab = (typeof TABS)[number];

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// Onglet et page dans l'URL : liens partageables, retour arrière cohérent.
const tab = computed<Tab>({
  get: () =>
    TABS.includes(route.query['tab'] as Tab) ? (route.query['tab'] as Tab) : 'orders',
  set: (value) =>
    void router.replace({ query: { ...route.query, tab: value, page: undefined } })
});
const orders = useOrdersOf(() => session.user.value?.email);
const pageCount = computed(() => Math.max(1, Math.ceil(orders.value.length / PAGE_SIZE)));
const page = computed<number>({
  get: () => {
    const value = Number(route.query['page'] ?? 1);
    return Number.isInteger(value) ? Math.min(Math.max(value, 1), pageCount.value) : 1;
  },
  set: (value) =>
    void router.replace({
      query: { ...route.query, page: value > 1 ? value : undefined }
    })
});

const tabs = computed(() =>
  TABS.map((value) => ({ value, label: t(`account.tabs.${value}`) }))
);

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  confirmed: 'info',
  preparing: 'neutral',
  delivered: 'success',
  cancelled: 'danger'
};
const TAGS: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

const columns = computed<TableColumn[]>(() => [
  { key: 'number', label: t('account.orders.columns.number'), rowHeader: true },
  { key: 'date', label: t('account.orders.date') },
  { key: 'offer', label: t('account.orders.offer') },
  { key: 'status', label: t('account.orders.columns.status') },
  { key: 'total', label: t('account.orders.total'), align: 'end' }
]);
const rows = computed(() =>
  orders.value
    .slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
    .map((order) => ({
      number: order.number,
      date: new Intl.DateTimeFormat(TAGS[locale.value as Locale], {
        dateStyle: 'medium'
      }).format(new Date(order.placedAt)),
      offer: t(`order.offers.${order.offer}.name`),
      status: order.status,
      total: formatPrice(order.total, locale.value as Locale)
    }))
);

// Changer de page : le focus va au tableau, pour que la nouvelle page soit lue.
const tableWrapper = ref<HTMLElement>();
watch(page, async () => {
  await nextTick();
  tableWrapper.value?.querySelector<HTMLElement>('.f-table')?.focus();
});

const preferences = reactive(loadPreferences(session.user.value?.email ?? ''));
const saving = ref(false);

async function onSavePreferences() {
  const email = session.user.value?.email;
  if (!email) return;
  saving.value = true;
  try {
    await savePreferences(email, { ...preferences });
    toast.show({ title: t('toasts.preferencesSaved.title'), tone: 'success' });
  } finally {
    saving.value = false;
  }
}

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

  <FTabs
    v-model="tab"
    :tabs="tabs"
    :label="t('account.tabs.label')"
    class="tb-account__tabs"
  >
    <template #orders>
      <div v-if="orders.length" ref="tableWrapper" class="tb-account__orders">
        <FTable
          :caption="t('account.orders.title')"
          :columns="columns"
          :rows="rows"
          row-key="number"
        >
          <template #cell="{ column, value }">
            <FBadge
              v-if="column.key === 'status'"
              :tone="STATUS_TONE[value as OrderStatus]"
              size="sm"
            >
              {{ t(`account.status.${String(value)}`) }}
            </FBadge>
            <template v-else>{{ value }}</template>
          </template>
        </FTable>
        <FPagination
          v-model:page="page"
          :page-count="pageCount"
          :label="t('account.orders.pagination.label')"
          :previous-label="t('account.orders.pagination.previous')"
          :next-label="t('account.orders.pagination.next')"
          :page-label="(n: number) => t('account.orders.pagination.page', { n })"
        />
      </div>
      <FEmptyState
        v-else
        :title="t('account.orders.emptyTitle')"
        :description="t('account.orders.emptyBody')"
        :heading-level="2"
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
    </template>

    <template #preferences>
      <form class="tb-account__preferences" @submit.prevent="onSavePreferences">
        <fieldset class="tb-account__fieldset">
          <legend class="tb-account__legend">
            {{ t('account.preferences.legend') }}
          </legend>
          <FSwitch
            v-model="preferences.trackingEmails"
            name="trackingEmails"
            :label="t('account.preferences.tracking')"
            :description="t('account.preferences.trackingHint')"
          />
          <FSwitch
            v-model="preferences.newsletter"
            name="newsletter"
            :label="t('account.preferences.newsletter')"
            :description="t('account.preferences.newsletterHint')"
          />
        </fieldset>
        <div>
          <FButton
            type="submit"
            variant="primary"
            :loading="saving"
            :loading-label="t('account.preferences.saving')"
          >
            {{ t('account.preferences.save') }}
          </FButton>
        </div>
      </form>
    </template>
  </FTabs>

  <p class="tb-actions">
    <FButton @click="signOut">{{ t('account.signOut') }}</FButton>
  </p>
</template>

<style>
.tb-account__tabs {
  margin-block-start: var(--f-space-8);
}

.tb-account__orders {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-4);
}

.tb-account__preferences {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-6);
  max-inline-size: 32rem;
}

.tb-account__fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-5);
  min-inline-size: 0;
  padding: 0;
  margin: 0;
  border: 0;
}

.tb-account__legend {
  padding: 0;
  margin-block-end: var(--f-space-4);
  font-weight: var(--f-font-weight-semibold);
}
</style>
