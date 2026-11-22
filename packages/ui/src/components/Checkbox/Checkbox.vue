<script setup lang="ts">
import { computed, ref, useId } from 'vue';

defineOptions({ name: 'FCheckbox', inheritAttrs: false });

const { label, description, error, required, disabled, id } = defineProps<{
  label: string;
  /** Précision sous le libellé, reliée par aria-describedby. */
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}>();

const model = defineModel<boolean>({ default: false });

const generated = useId();
const inputId = computed(() => id ?? `f-checkbox-${generated}`);
const descriptionId = computed(() => `${inputId.value}-description`);
const errorId = computed(() => `${inputId.value}-error`);
const describedBy = computed(
  () =>
    [description ? descriptionId.value : '', error ? errorId.value : '']
      .filter(Boolean)
      .join(' ') || undefined
);

const input = ref<HTMLInputElement>();
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div :class="['f-checkbox', { 'f-checkbox--invalid': error }]">
    <p v-if="error" :id="errorId" class="f-checkbox__error">{{ error }}</p>
    <div class="f-checkbox__row">
      <input
        :id="inputId"
        ref="input"
        v-model="model"
        v-bind="$attrs"
        class="f-checkbox__input"
        type="checkbox"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
      />
      <div class="f-checkbox__text">
        <label :for="inputId" class="f-checkbox__label">{{ label }}</label>
        <p v-if="description" :id="descriptionId" class="f-checkbox__description">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.f-checkbox {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-1);
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
}

.f-checkbox--invalid {
  padding-inline-start: var(--f-space-3);
  border-inline-start: var(--f-space-1) solid var(--f-color-danger);
}

.f-checkbox__row {
  display: flex;
  gap: var(--f-space-3);
  align-items: flex-start;
}

.f-checkbox__input {
  flex: none;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  margin: 0.125rem 0 0;
  accent-color: var(--f-color-accent);
  cursor: pointer;
}

.f-checkbox__input:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-checkbox__label {
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  cursor: pointer;
}

.f-checkbox__description {
  margin: 0;
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-checkbox__error {
  margin: 0;
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-danger);
}
</style>
