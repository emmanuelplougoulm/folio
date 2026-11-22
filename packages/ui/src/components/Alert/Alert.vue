<script setup lang="ts">
import { computed } from 'vue';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

defineOptions({ name: 'FAlert' });

const {
  tone = 'info',
  title,
  live = 'off'
} = defineProps<{
  tone?: AlertTone;
  title?: string;
  /**
   * Annonce aux lecteurs d'écran : « assertive » (role=alert) pour une erreur qui apparaît
   * après une action, « polite » (role=status) pour une confirmation, « off » pour un
   * message présent dès le chargement.
   */
  live?: 'off' | 'polite' | 'assertive';
}>();

defineSlots<{
  default?(): unknown;
  actions?(): unknown;
}>();

const role = computed(() =>
  live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined
);

const icons: Record<AlertTone, string> = {
  info: 'M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 6a.9.9 0 0 0-.9.9v3.2a.9.9 0 1 0 1.8 0V7.9A.9.9 0 0 0 8 7Zm0-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  success:
    'M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm3.1 4.4a.9.9 0 0 0-1.3.1L7.2 8.9 6.1 7.8a.9.9 0 1 0-1.3 1.3l1.8 1.8a.9.9 0 0 0 1.3-.1l3.3-4.1a.9.9 0 0 0-.1-1.3Z',
  warning:
    'M8.9 1.6a1 1 0 0 0-1.8 0L.6 13.4A1 1 0 0 0 1.5 15h13a1 1 0 0 0 .9-1.6L8.9 1.6ZM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0-6a.9.9 0 0 1 .9.9v3.2a.9.9 0 1 1-1.8 0V5.9A.9.9 0 0 1 8 5Z',
  danger:
    'M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 9.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM8 4a.9.9 0 0 0-.9.9v3.7a.9.9 0 1 0 1.8 0V4.9A.9.9 0 0 0 8 4Z'
};
</script>

<template>
  <div :class="['f-alert', `f-alert--${tone}`]" :role="role">
    <svg class="f-alert__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path :d="icons[tone]" />
    </svg>
    <div class="f-alert__body">
      <p v-if="title" class="f-alert__title">{{ title }}</p>
      <div v-if="$slots.default" class="f-alert__content"><slot /></div>
      <div v-if="$slots.actions" class="f-alert__actions"><slot name="actions" /></div>
    </div>
  </div>
</template>

<style>
.f-alert {
  --f-alert-tone: var(--f-color-accent);
  --f-alert-bg: var(--f-color-accent-subtle);

  display: flex;
  gap: var(--f-space-3);
  padding: var(--f-space-4);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  background: var(--f-alert-bg);
  border: var(--f-border-width-thin) solid var(--f-alert-tone);
  border-inline-start-width: var(--f-space-1);
  border-radius: var(--f-radius-md);
}

.f-alert--success {
  --f-alert-tone: var(--f-color-success);
  --f-alert-bg: var(--f-color-success-subtle);
}

.f-alert--warning {
  --f-alert-tone: var(--f-color-warning);
  --f-alert-bg: var(--f-color-warning-subtle);
}

.f-alert--danger {
  --f-alert-tone: var(--f-color-danger);
  --f-alert-bg: var(--f-color-danger-subtle);
}

.f-alert__icon {
  flex: none;
  inline-size: 1.25em;
  block-size: 1.25em;
  margin-block-start: 0.125em;
  fill: var(--f-alert-tone);
}

.f-alert__body {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-1);
  min-inline-size: 0;
}

.f-alert__title {
  margin: 0;
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-alert-tone);
}

.f-alert__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-2);
  margin-block-start: var(--f-space-2);
}
</style>
