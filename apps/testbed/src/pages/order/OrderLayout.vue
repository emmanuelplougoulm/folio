<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FStepper } from '@emmanuelplougoulm/folio';
import { draft } from '../../order/draft';
import { stepsOf } from '../../order/process';

const { t, locale } = useI18n();
const route = useRoute();

// Les étapes dépendent de la version du processus avec laquelle la commande a commencé.
const steps = computed(() =>
  stepsOf(draft.processVersion).map((id) => ({ id, label: t(`order.steps.${id}`) }))
);
const current = computed(() =>
  Math.max(
    steps.value.findIndex((step) => step.id === route.meta.step),
    0
  )
);
const statusLabels = computed(() => ({
  complete: t('order.stepStatus.complete'),
  current: t('order.stepStatus.current'),
  upcoming: t('order.stepStatus.upcoming')
}));
</script>

<template>
  <div class="tb-order">
    <FStepper
      :steps="steps"
      :current="current"
      :label="t('order.stepsLabel')"
      :status-labels="statusLabels"
    >
      <template #step="{ step, status }">
        <RouterLink
          v-if="status === 'complete'"
          :to="{ name: `order-${step.id}`, params: { locale } }"
          class="tb-order__step-link"
          >{{ step.label }}</RouterLink
        >
        <template v-else>{{ step.label }}</template>
      </template>
    </FStepper>
    <RouterView />
    <p class="tb-order__version">
      {{
        t('process.inOrder', { version: t(`process.versions.${draft.processVersion}`) })
      }}
      <RouterLink :to="{ name: 'process', params: { locale } }">{{
        t('process.notesLink')
      }}</RouterLink>
    </p>
  </div>
</template>

<style>
.tb-order {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-8);
  max-inline-size: 36rem;
}

.tb-order__version {
  margin: 0;
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.tb-order__step-link {
  color: var(--f-color-accent);
}

.tb-order__form {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-6);
  margin-block-start: var(--f-space-6);
}

.tb-order__nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-3);
  align-items: center;
  justify-content: space-between;
}

.tb-order__price {
  font-variant-numeric: tabular-nums;
  font-weight: var(--f-font-weight-semibold);
  white-space: nowrap;
}

.tb-order__row {
  display: grid;
  grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
  gap: var(--f-space-4);
}
</style>
