<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <h1 class="tb-title">{{ t('home.title') }}</h1>
  <p class="tb-lead">{{ t('home.intro') }}</p>
</template>

<style>
.tb-title {
  margin: 0;
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-3xl);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-tight);
}

.tb-lead {
  margin-block: var(--f-space-4) 0;
  font-size: var(--f-font-size-lg);
  color: var(--f-color-text-muted);
}
</style>
