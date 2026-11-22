<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FAlert,
  FButton,
  FErrorSummary,
  FFormField,
  FPasswordInput,
  FTextInput,
  type ErrorSummaryItem
} from '@emmanuelplougoulm/folio';
import { signIn } from '../services/auth';
import { session } from '../services/session';
import { validateEmail, validatePassword } from '../forms/validators';
import { ACCOUNTS, DEMO_PASSWORD } from '../mocks/accounts';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const submitted = ref(false);
const pending = ref(false);
const failure = ref<'invalid-credentials' | 'account-locked' | null>(null);

// Les erreurs n'apparaissent qu'après la première soumission, puis suivent la saisie.
const fieldErrors = computed(() =>
  submitted.value
    ? { email: validateEmail(form.email), password: validatePassword(form.password) }
    : { email: undefined, password: undefined }
);

// Figé à chaque soumission : le récapitulatif prend le focus à chaque tentative.
const summary = ref<ErrorSummaryItem[]>([]);

async function onSubmit() {
  submitted.value = true;
  failure.value = null;
  const errors = fieldErrors.value;
  summary.value = (['email', 'password'] as const).flatMap((field) => {
    const key = errors[field];
    return key ? [{ id: field, message: t(key) }] : [];
  });
  if (summary.value.length) return;

  pending.value = true;
  try {
    const result = await signIn(form.email, form.password);
    if (!result.ok) {
      failure.value = result.reason;
      return;
    }
    session.start(result.user);
    const redirect = route.query['redirect'];
    await router.push(
      typeof redirect === 'string' && redirect.startsWith('/')
        ? redirect
        : { name: 'account', params: { locale: locale.value } }
    );
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="tb-login">
    <h1 class="tb-title">{{ t('login.title') }}</h1>
    <p class="tb-lead">{{ t('login.intro') }}</p>

    <FErrorSummary
      :title="t('login.errorSummary', summary.length)"
      :errors="summary"
      class="tb-login__block"
    />

    <FAlert
      v-if="failure"
      tone="danger"
      live="assertive"
      :title="t('login.failed')"
      class="tb-login__block"
    >
      {{
        failure === 'account-locked'
          ? t('login.accountLocked')
          : t('login.invalidCredentials')
      }}
    </FAlert>

    <form class="tb-login__form" novalidate @submit.prevent="onSubmit">
      <FFormField
        id="email"
        :label="t('login.email')"
        :error="fieldErrors.email && t(fieldErrors.email)"
        required
      >
        <FTextInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="username"
          inputmode="email"
          autocapitalize="off"
          spellcheck="false"
        />
      </FFormField>
      <FFormField
        id="password"
        :label="t('login.password')"
        :error="fieldErrors.password && t(fieldErrors.password)"
        required
      >
        <FPasswordInput
          v-model="form.password"
          name="password"
          autocomplete="current-password"
          :show-label="t('login.showPassword')"
          :hide-label="t('login.hidePassword')"
        />
      </FFormField>
      <FButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="pending"
        :loading-label="t('login.submitting')"
      >
        {{ t('login.submit') }}
      </FButton>
    </form>

    <FAlert :title="t('login.demoTitle')" class="tb-login__block">
      <i18n-t keypath="login.demoBody" tag="span" scope="global">
        <template #email
          ><code class="tb-code">{{ ACCOUNTS.demo.email }}</code></template
        >
        <template #password
          ><code class="tb-code">{{ DEMO_PASSWORD }}</code></template
        >
      </i18n-t>
    </FAlert>
  </div>
</template>

<style>
.tb-login {
  max-inline-size: 28rem;
}

.tb-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-5);
  margin-block-start: var(--f-space-8);
}

.tb-login__block {
  margin-block-start: var(--f-space-6);
}
</style>
