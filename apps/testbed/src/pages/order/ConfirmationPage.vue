<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FAlert, FButton } from '@emmanuelplougoulm/folio';
import { lastOrder } from '../../order/draft';

const { t, locale } = useI18n();
</script>

<template>
  <h1 class="tb-title">{{ t('order.confirmation.title') }}</h1>
  <FAlert
    v-if="lastOrder"
    tone="success"
    live="polite"
    :title="t('order.confirmation.alertTitle')"
    class="tb-order__block"
  >
    <i18n-t keypath="order.confirmation.body" tag="span" scope="global">
      <template #number
        ><strong class="tb-code">{{ lastOrder.number }}</strong></template
      >
    </i18n-t>
  </FAlert>
  <p class="tb-actions">
    <FButton :as="RouterLink" :to="{ name: 'home', params: { locale } }">{{
      t('order.confirmation.home')
    }}</FButton>
  </p>
</template>
