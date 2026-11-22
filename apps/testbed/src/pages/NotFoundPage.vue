<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FBreadcrumb, FButton } from '@emmanuelplougoulm/folio';

const { t, locale } = useI18n();
const breadcrumb = computed(() => [
  {
    label: t('home.breadcrumb'),
    link: { to: { name: 'home', params: { locale: locale.value } } }
  },
  { label: t('notFound.title') }
]);
</script>

<template>
  <FBreadcrumb
    :items="breadcrumb"
    :label="t('app.breadcrumb')"
    :as="RouterLink"
    class="tb-breadcrumb"
  />
  <h1 class="tb-title">{{ t('notFound.title') }}</h1>
  <p class="tb-lead">{{ t('notFound.body') }}</p>
  <p class="tb-actions">
    <FButton
      :as="RouterLink"
      :to="{ name: 'home', params: { locale } }"
      variant="primary"
      >{{ t('notFound.back') }}</FButton
    >
  </p>
</template>
