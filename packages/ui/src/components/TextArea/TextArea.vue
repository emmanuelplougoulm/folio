<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormField } from '../FormField/context';

defineOptions({ name: 'FTextArea' });

// Booléens à undefined par défaut : absents, ils héritent de FFormField.
const {
  id,
  rows = 4,
  maxlength,
  counter,
  invalid = undefined,
  required = undefined,
  disabled = undefined
} = defineProps<{
  id?: string;
  rows?: number;
  maxlength?: number;
  /** Texte du compteur, fourni par l'app pour être traduit : (saisis, maximum) => texte. */
  counter?: (length: number, max: number) => string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}>();

const model = defineModel<string>({ default: '' });

const field = useFormField();
const textarea = ref<HTMLTextAreaElement>();
const textareaId = computed(() => id ?? field?.id);
const counterId = computed(() =>
  textareaId.value ? `${textareaId.value}-counter` : undefined
);
const showCounter = computed(() => maxlength !== undefined && counter !== undefined);
const isInvalid = computed(() => invalid ?? field?.invalid.value ?? false);

const describedBy = computed(
  () =>
    [field?.describedBy.value, showCounter.value ? counterId.value : undefined]
      .filter(Boolean)
      .join(' ') || undefined
);

defineExpose({ focus: () => textarea.value?.focus() });
</script>

<template>
  <div class="f-text-area">
    <textarea
      :id="textareaId"
      ref="textarea"
      v-model="model"
      :class="['f-text-area__control', { 'f-text-area__control--invalid': isInvalid }]"
      :rows="rows"
      :maxlength="maxlength"
      :aria-describedby="describedBy"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :required="required ?? field?.required.value ?? false"
      :disabled="disabled ?? field?.disabled.value ?? false"
    ></textarea>
    <p
      v-if="showCounter && maxlength !== undefined && counter"
      :id="counterId"
      class="f-text-area__counter"
    >
      {{ counter(model.length, maxlength) }}
    </p>
  </div>
</template>

<style>
.f-text-area {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-1);
}

.f-text-area__control {
  box-sizing: border-box;
  inline-size: 100%;
  padding: var(--f-space-2) var(--f-space-3);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  resize: vertical;
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-md);
}

.f-text-area__control:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-text-area__control--invalid {
  border-color: var(--f-color-danger);
  box-shadow: inset 0 0 0 var(--f-border-width-thin) var(--f-color-danger);
}

.f-text-area__control:disabled {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
  background: var(--f-color-surface-sunken);
  border-color: var(--f-color-border-subtle);
}

.f-text-area__counter {
  margin: 0;
  font-size: var(--f-font-size-sm);
  font-variant-numeric: tabular-nums;
  color: var(--f-color-text-muted);
  text-align: end;
}
</style>
