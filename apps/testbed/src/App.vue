<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FLanguageSwitcher, FSkipLink, FToastProvider } from '@emmanuelplougoulm/folio';
import { LOCALES, type Locale } from './i18n';
import { session } from './services/session';

const { t, locale } = useI18n();
const route = useRoute();

/** Même page, autre langue : on ne remplace que le paramètre locale. */
const languages = computed(() =>
  LOCALES.map((code: Locale) => ({
    code,
    label: t(`locale.${code}`),
    link: {
      to: {
        name: route.name ?? 'home',
        params: { ...route.params, locale: code },
        query: route.query
      }
    }
  }))
);
</script>

<template>
  <FToastProvider
    :label="t('notifications.label')"
    :region-label="t('notifications.region')"
    :close-label="t('notifications.close')"
  >
    <FSkipLink>{{ t('app.skipToContent') }}</FSkipLink>
    <header class="tb-header">
      <RouterLink class="tb-header__brand" :to="{ name: 'home', params: { locale } }">
        {{ t('app.name') }}
      </RouterLink>
      <nav :aria-label="t('app.mainNav')" class="tb-header__nav">
        <RouterLink
          class="tb-header__link"
          :to="{ name: 'order-offer', params: { locale } }"
          >{{ t('nav.order') }}</RouterLink
        >
        <RouterLink
          class="tb-header__link"
          :to="{ name: 'outbox', params: { locale } }"
          >{{ t('nav.outbox') }}</RouterLink
        >
        <RouterLink
          v-if="session.user.value"
          class="tb-header__link"
          :to="{ name: 'account', params: { locale } }"
          >{{ t('nav.account') }}</RouterLink
        >
        <RouterLink
          v-else
          class="tb-header__link"
          :to="{ name: 'login', params: { locale } }"
          >{{ t('nav.signIn') }}</RouterLink
        >
      </nav>
      <FLanguageSwitcher
        :languages="languages"
        :current="locale"
        :label="t('locale.label')"
        :as="RouterLink"
      />
    </header>
    <main id="main" class="tb-main" tabindex="-1">
      <RouterView />
    </main>
  </FToastProvider>
</template>

<style>
.tb-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-4) var(--f-space-8);
  align-items: center;
  padding: var(--f-space-4) var(--f-space-6);
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}

.tb-header__brand {
  margin-inline-end: auto;
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-lg);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-text);
  text-decoration: none;
}

.tb-header__nav {
  display: flex;
  gap: var(--f-space-4);
}

.tb-header__link {
  color: var(--f-color-accent);
}

.tb-main {
  max-inline-size: 48rem;
  padding: var(--f-space-8) var(--f-space-6);
  margin-inline: auto;
}

.tb-main:focus {
  outline: none;
}
</style>
