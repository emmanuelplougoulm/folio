<script setup lang="ts">
import { computed, useId } from 'vue';

defineOptions({ name: 'FSwitch', inheritAttrs: false });

const { label, description, disabled, id } = defineProps<{
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}>();

const model = defineModel<boolean>({ default: false });

const generated = useId();
const inputId = computed(() => id ?? `f-switch-${generated}`);
const descriptionId = computed(() => `${inputId.value}-description`);
</script>

<template>
  <div class="f-switch">
    <div class="f-switch__text">
      <label :for="inputId" class="f-switch__label">{{ label }}</label>
      <p v-if="description" :id="descriptionId" class="f-switch__description">
        {{ description }}
      </p>
    </div>
    <!-- Case native avec role=switch : clavier (Espace), formulaire et état « activé » natifs. -->
    <input
      :id="inputId"
      v-model="model"
      v-bind="$attrs"
      class="f-switch__input"
      type="checkbox"
      role="switch"
      :disabled="disabled"
      :aria-describedby="description ? descriptionId : undefined"
    />
  </div>
</template>

<style>
.f-switch {
  display: flex;
  gap: var(--f-space-4);
  align-items: flex-start;
  justify-content: space-between;
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
}

.f-switch__label {
  font-weight: var(--f-font-weight-medium);
  cursor: pointer;
}

.f-switch__description {
  margin: var(--f-space-1) 0 0;
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-switch__input {
  position: relative;
  flex: none;
  inline-size: 2.75rem;
  block-size: 1.5rem;
  margin: 0;
  appearance: none;
  cursor: pointer;
  background: var(--f-color-surface-sunken);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-full);
  transition: background-color var(--f-duration-fast) var(--f-easing-standard);
}

.f-switch__input::before {
  position: absolute;
  inset-block-start: var(--f-space-1);
  inset-inline-start: var(--f-space-1);
  inline-size: 1rem;
  block-size: 1rem;
  content: '';
  background: var(--f-color-text-muted);
  border-radius: var(--f-radius-full);
  transition: transform var(--f-duration-fast) var(--f-easing-standard);
}

.f-switch__input:checked {
  background: var(--f-color-accent);
  border-color: var(--f-color-accent);
}

.f-switch__input:checked::before {
  background: var(--f-color-on-accent);
  transform: translateX(1.25rem);
}

.f-switch__input:dir(rtl):checked::before {
  transform: translateX(-1.25rem);
}

.f-switch__input:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-switch__input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .f-switch__input,
  .f-switch__input::before {
    transition: none;
  }
}
</style>
