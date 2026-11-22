<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LOCALES, type Locale } from './i18n';

const { t, locale } = useI18n();
const route = useRoute();

/** Même page, autre langue : on ne remplace que le paramètre locale. */
const localeLinks = computed(() =>
  LOCALES.map((code: Locale) => ({
    code,
    to: { name: route.name ?? 'home', params: { ...route.params, locale: code } }
  }))
);
</script>

<template>
  <a class="tb-skip-link" href="#main">{{ t('app.skipToContent') }}</a>
  <header class="tb-header">
    <RouterLink class="tb-header__brand" :to="{ name: 'home', params: { locale } }">
      {{ t('app.name') }}
    </RouterLink>
    <nav :aria-label="t('locale.label')">
      <ul class="tb-header__locales">
        <li v-for="link in localeLinks" :key="link.code">
          <RouterLink
            :to="link.to"
            :lang="link.code"
            :hreflang="link.code"
            :aria-current="link.code === locale ? 'true' : undefined"
            class="tb-header__locale"
          >
            {{ t(`locale.${link.code}`) }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
  <main id="main" class="tb-main" tabindex="-1">
    <RouterView />
  </main>
</template>

<style>
.tb-skip-link {
  position: absolute;
  inset-inline-start: var(--f-space-4);
  inset-block-start: var(--f-space-2);
  padding: var(--f-space-2) var(--f-space-3);
  color: var(--f-color-on-accent);
  background: var(--f-color-accent);
  border-radius: var(--f-radius-md);
  transform: translateY(-200%);
}

.tb-skip-link:focus-visible {
  transform: none;
}

.tb-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-4);
  align-items: center;
  justify-content: space-between;
  padding: var(--f-space-4) var(--f-space-6);
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}

.tb-header__brand {
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-lg);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-text);
  text-decoration: none;
}

.tb-header__locales {
  display: flex;
  gap: var(--f-space-4);
  padding: 0;
  margin: 0;
  list-style: none;
}

.tb-header__locale {
  color: var(--f-color-accent);
}

.tb-header__locale[aria-current='true'] {
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-color-text);
  text-decoration: none;
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
