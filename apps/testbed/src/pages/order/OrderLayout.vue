<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { FStepper } from '@emmanuelplougoulm/folio';
import { ORDER_STEPS } from '../../order/steps';

const { t, locale } = useI18n();
const route = useRoute();

const steps = computed(() =>
  ORDER_STEPS.map((id) => ({ id, label: t(`order.steps.${id}`) }))
);
const current = computed(() => route.meta.step ?? 0);
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
  </div>
</template>

<style>
.tb-order {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-8);
  max-inline-size: 36rem;
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
