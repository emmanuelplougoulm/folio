<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FBreadcrumb, FButton } from '@emmanuelplougoulm/folio';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

/** Page d'origine de l'erreur, pour « Réessayer ». */
const from = computed(() => {
  const value = route.query['from'];
  return typeof value === 'string' && value.startsWith('/') ? value : null;
});
const breadcrumb = computed(() => [
  {
    label: t('home.breadcrumb'),
    link: { to: { name: 'home', params: { locale: locale.value } } }
  },
  { label: t('serverError.title') }
]);
</script>

<template>
  <FBreadcrumb
    :items="breadcrumb"
    :label="t('app.breadcrumb')"
    :as="RouterLink"
    class="tb-breadcrumb"
  />
  <h1 class="tb-title">{{ t('serverError.title') }}</h1>
  <p class="tb-lead">{{ t('serverError.body') }}</p>
  <p class="tb-actions">
    <FButton v-if="from" variant="primary" @click="router.replace(from)">{{
      t('serverError.retry')
    }}</FButton>
    <FButton :as="RouterLink" :to="{ name: 'home', params: { locale } }">{{
      t('serverError.home')
    }}</FButton>
  </p>
</template>
