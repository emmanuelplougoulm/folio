<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FButton } from '@emmanuelplougoulm/folio';
import { session } from '../services/session';

const { t, locale } = useI18n();
const router = useRouter();

async function signOut() {
  session.end();
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
  <p class="tb-actions">
    <FButton @click="signOut">{{ t('account.signOut') }}</FButton>
  </p>
</template>
