<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FBreadcrumb,
  FButton,
  FCard,
  FDescriptionList,
  FEmptyState,
  FTable,
  useToast,
  type TableColumn
} from '@emmanuelplougoulm/folio';
import { clearOutbox, outbox } from '../services/mailer';
import type { Locale } from '../i18n';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const TAGS: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };
const format = (iso: string) =>
  new Intl.DateTimeFormat(TAGS[locale.value as Locale], {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(iso));

// E-mail ouvert : dans l'URL (?mail=), pour un lien direct depuis un test.
const selected = computed(
  () => outbox.value.find((mail) => mail.id === route.query['mail']) ?? outbox.value[0]
);

const columns = computed<TableColumn[]>(() => [
  { key: 'subject', label: t('outbox.columns.subject'), rowHeader: true },
  { key: 'to', label: t('outbox.columns.to') },
  { key: 'language', label: t('outbox.columns.language') },
  { key: 'sentAt', label: t('outbox.columns.sentAt') }
]);
const rows = computed(() =>
  outbox.value.map((mail) => ({
    id: mail.id,
    subject: mail.subject,
    to: mail.to,
    language: t(`locale.${mail.locale}`),
    sentAt: format(mail.sentAt)
  }))
);

const details = computed(() =>
  selected.value
    ? [
        { term: t('outbox.columns.to'), details: selected.value.to },
        {
          term: t('outbox.columns.language'),
          details: t(`locale.${selected.value.locale}`)
        },
        { term: t('outbox.preheader'), details: selected.value.preheader }
      ]
    : []
);

const breadcrumb = computed(() => [
  {
    label: t('home.breadcrumb'),
    link: { to: { name: 'home', params: { locale: locale.value } } }
  },
  { label: t('outbox.title') }
]);

function open(id: unknown) {
  void router.replace({ query: { ...route.query, mail: String(id) } });
}

function onClear() {
  clearOutbox();
  void router.replace({ query: {} });
  toast.show({ title: t('outbox.cleared'), tone: 'info' });
}
</script>

<template>
  <FBreadcrumb
    :items="breadcrumb"
    :label="t('app.breadcrumb')"
    :as="RouterLink"
    class="tb-breadcrumb"
  />
  <h1 class="tb-title">{{ t('outbox.title') }}</h1>
  <p class="tb-lead">{{ t('outbox.intro') }}</p>

  <div v-if="outbox.length" class="tb-outbox">
    <FTable :caption="t('outbox.caption')" :columns="columns" :rows="rows" row-key="id">
      <template #cell="{ row, column, value }">
        <button
          v-if="column.key === 'subject'"
          type="button"
          class="tb-outbox__open"
          :aria-pressed="selected?.id === row['id'] ? 'true' : 'false'"
          @click="open(row['id'])"
        >
          {{ value }}
        </button>
        <template v-else>{{ value }}</template>
      </template>
    </FTable>

    <FCard v-if="selected" as="article" :title="selected.subject" :heading-level="2">
      <FDescriptionList :items="details" layout="stacked" />
      <!-- Aperçu isolé : sandbox sans script, comme une messagerie. -->
      <iframe
        :key="selected.id"
        class="tb-outbox__preview"
        :title="t('outbox.previewTitle', { subject: selected.subject })"
        :srcdoc="selected.html"
        sandbox=""
      ></iframe>
      <details class="tb-outbox__text">
        <summary>{{ t('outbox.textVersion') }}</summary>
        <pre>{{ selected.text }}</pre>
      </details>
    </FCard>

    <p>
      <FButton @click="onClear">{{ t('outbox.clear') }}</FButton>
    </p>
  </div>

  <FEmptyState
    v-else
    :title="t('outbox.emptyTitle')"
    :description="t('outbox.emptyBody')"
    class="tb-order__block"
  >
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

<style>
.tb-outbox {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-6);
  margin-block-start: var(--f-space-8);
}

.tb-outbox__open {
  padding: 0;
  font: inherit;
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-accent);
  text-align: start;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: 0;
}

.tb-outbox__open[aria-pressed='true'] {
  color: var(--f-color-text);
  text-decoration: none;
}

.tb-outbox__open:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.tb-outbox__preview {
  inline-size: 100%;
  block-size: 40rem;
  background: var(--f-color-bg);
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-radius: var(--f-radius-md);
}

.tb-outbox__text pre {
  padding: var(--f-space-4);
  overflow-x: auto;
  font-family: var(--f-font-family-mono);
  font-size: var(--f-font-size-sm);
  white-space: pre-wrap;
  background: var(--f-color-surface-sunken);
  border-radius: var(--f-radius-md);
}
</style>
