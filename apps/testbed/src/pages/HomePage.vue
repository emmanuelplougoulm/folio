<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FButton } from '@emmanuelplougoulm/folio';
import { session } from '../services/session';

const { t, locale } = useI18n();
</script>

<template>
  <h1 class="tb-title">{{ t('home.title') }}</h1>
  <p class="tb-lead">{{ t('home.intro') }}</p>
  <p class="tb-actions">
    <FButton
      v-if="session.user.value"
      :as="RouterLink"
      :to="{ name: 'account', params: { locale } }"
      variant="primary"
      size="lg"
    >
      {{ t('home.ctaAccount') }}
    </FButton>
    <FButton
      v-else
      :as="RouterLink"
      :to="{ name: 'login', params: { locale } }"
      variant="primary"
      size="lg"
    >
      {{ t('home.cta') }}
    </FButton>
    <FButton :as="RouterLink" :to="{ name: 'order-offer', params: { locale } }" size="lg">
      {{ t('home.ctaOrder') }}
    </FButton>
  </p>
</template>
