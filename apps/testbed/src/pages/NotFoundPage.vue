<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
</script>

<template>
  <h1 class="tb-title">{{ t('notFound.title') }}</h1>
  <p class="tb-lead">{{ t('notFound.body') }}</p>
  <p>
    <RouterLink :to="{ name: 'home', params: { locale } }">{{
      t('notFound.back')
    }}</RouterLink>
  </p>
</template>
