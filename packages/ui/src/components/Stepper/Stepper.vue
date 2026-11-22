<script setup lang="ts">
export interface StepperStep {
  id: string;
  label: string;
}

export type StepStatus = 'complete' | 'current' | 'upcoming';

defineOptions({ name: 'FStepper' });

const { steps, current, label, statusLabels } = defineProps<{
  steps: readonly StepperStep[];
  /** Index (base 0) de l'étape en cours. */
  current: number;
  /** Nom de la navigation, par exemple « Étapes de la commande ». */
  label: string;
  /** Texte lu après chaque étape, pour ne pas reposer sur la couleur seule. */
  statusLabels: Record<StepStatus, string>;
}>();

defineSlots<{
  /** Rendu du libellé, par exemple un RouterLink vers une étape terminée. */
  step?(props: { step: StepperStep; index: number; status: StepStatus }): unknown;
}>();

const statusOf = (index: number): StepStatus =>
  index < current ? 'complete' : index === current ? 'current' : 'upcoming';
</script>

<template>
  <nav class="f-stepper" :aria-label="label">
    <ol class="f-stepper__list">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        :class="['f-stepper__item', `f-stepper__item--${statusOf(index)}`]"
        :aria-current="statusOf(index) === 'current' ? 'step' : undefined"
      >
        <span class="f-stepper__marker" aria-hidden="true">
          <svg
            v-if="statusOf(index) === 'complete'"
            viewBox="0 0 16 16"
            class="f-stepper__check"
          >
            <path
              d="M13.2 4.3a.9.9 0 0 1 0 1.3l-6 6a.9.9 0 0 1-1.3 0l-3-3a.9.9 0 1 1 1.3-1.3L6.5 9.6l5.4-5.3a.9.9 0 0 1 1.3 0Z"
            />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="f-stepper__label">
          <slot name="step" :step="step" :index="index" :status="statusOf(index)">{{
            step.label
          }}</slot>
          <span class="f-stepper__status">{{ statusLabels[statusOf(index)] }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style>
.f-stepper {
  font-family: var(--f-font-family-sans);
}

.f-stepper__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-2) var(--f-space-6);
  padding: 0;
  margin: 0;
  list-style: none;
}

.f-stepper__item {
  display: flex;
  gap: var(--f-space-2);
  align-items: center;
  color: var(--f-color-text-muted);
}

.f-stepper__marker {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-full);
}

.f-stepper__check {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentcolor;
}

.f-stepper__label {
  display: flex;
  flex-direction: column;
  font-size: var(--f-font-size-sm);
  line-height: var(--f-font-line-height-snug);
}

.f-stepper__status {
  font-size: var(--f-font-size-xs);
}

.f-stepper__item--complete {
  color: var(--f-color-text);
}

.f-stepper__item--complete .f-stepper__marker {
  color: var(--f-color-on-accent);
  background: var(--f-color-accent);
  border-color: var(--f-color-accent);
}

.f-stepper__item--current {
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-color-text);
}

.f-stepper__item--current .f-stepper__marker {
  color: var(--f-color-accent);
  border-width: var(--f-border-width-thick);
  border-color: var(--f-color-accent);
}
</style>
