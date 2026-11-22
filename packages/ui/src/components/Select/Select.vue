<script setup lang="ts" generic="T extends string">
import { computed, ref } from 'vue';
import { useFormField } from '../FormField/context';

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

defineOptions({ name: 'FSelect' });

// Booléens à undefined par défaut : absents, ils héritent de FFormField.
const {
  options,
  placeholder,
  id,
  invalid = undefined,
  required = undefined,
  disabled = undefined
} = defineProps<{
  options: readonly SelectOption<T>[];
  /** Première option vide, non sélectionnable : « Choisissez un pays ». */
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}>();

const model = defineModel<T | ''>({ default: '' });

const field = useFormField();
const select = ref<HTMLSelectElement>();
const isInvalid = computed(() => invalid ?? field?.invalid.value ?? false);

defineExpose({ focus: () => select.value?.focus() });
</script>

<template>
  <div class="f-select">
    <select
      :id="id ?? field?.id"
      ref="select"
      v-model="model"
      :class="['f-select__control', { 'f-select__control--invalid': isInvalid }]"
      :aria-describedby="field?.describedBy.value"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :required="required ?? field?.required.value ?? false"
      :disabled="disabled ?? field?.disabled.value ?? false"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <svg class="f-select__chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.3 5.8a.9.9 0 0 1 1.3 0L8 9.2l3.4-3.4a.9.9 0 1 1 1.3 1.3l-4 4a.9.9 0 0 1-1.3 0l-4-4a.9.9 0 0 1 0-1.3Z"
      />
    </svg>
  </div>
</template>

<style>
.f-select {
  position: relative;
  display: flex;
}

.f-select__control {
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: 2.75rem;
  padding: var(--f-space-2) var(--f-space-10) var(--f-space-2) var(--f-space-3);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  appearance: none;
  cursor: pointer;
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-md);
}

.f-select__control:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-select__control--invalid {
  border-color: var(--f-color-danger);
  box-shadow: inset 0 0 0 var(--f-border-width-thin) var(--f-color-danger);
}

.f-select__control:disabled {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
  background: var(--f-color-surface-sunken);
  border-color: var(--f-color-border-subtle);
}

.f-select__chevron {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: var(--f-space-3);
  inline-size: 1rem;
  block-size: 1rem;
  pointer-events: none;
  fill: var(--f-color-text-muted);
  transform: translateY(-50%);
}
</style>
