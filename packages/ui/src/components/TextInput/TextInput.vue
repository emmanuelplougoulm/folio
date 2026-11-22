<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormField } from '../FormField/context';

export type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';

defineOptions({ name: 'FTextInput' });

// Les booléens valent undefined par défaut (et non false, comme le ferait Vue) :
// absents, ils héritent de FFormField.
const {
  type = 'text',
  id,
  invalid = undefined,
  required = undefined,
  disabled = undefined,
  block = true
} = defineProps<{
  type?: TextInputType;
  /** Par défaut, l'id fourni par FFormField. */
  id?: string;
  /** Par défaut, déduit de l'erreur de FFormField. */
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  /** Occupe toute la largeur disponible (par défaut). */
  block?: boolean;
}>();

const model = defineModel<string>({ default: '' });

const field = useFormField();
const input = ref<HTMLInputElement>();

const isInvalid = computed(() => invalid ?? field?.invalid.value ?? false);
const isRequired = computed(() => required ?? field?.required.value ?? false);
const isDisabled = computed(() => disabled ?? field?.disabled.value ?? false);

defineExpose({
  /** Place le focus dans le champ. */
  focus: () => input.value?.focus()
});
</script>

<template>
  <input
    :id="id ?? field?.id"
    ref="input"
    v-model="model"
    :class="[
      'f-text-input',
      { 'f-text-input--invalid': isInvalid, 'f-text-input--block': block }
    ]"
    :type="type"
    :aria-describedby="field?.describedBy.value"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :required="isRequired"
    :disabled="isDisabled"
  />
</template>

<style>
.f-text-input {
  box-sizing: border-box;
  min-block-size: 2.75rem;
  padding: var(--f-space-2) var(--f-space-3);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-md);
}

.f-text-input--block {
  inline-size: 100%;
}

.f-text-input::placeholder {
  color: var(--f-color-text-muted);
  opacity: 1;
}

.f-text-input:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-text-input--invalid {
  border-color: var(--f-color-danger);
  box-shadow: inset 0 0 0 var(--f-border-width-thin) var(--f-color-danger);
}

.f-text-input:disabled {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
  background: var(--f-color-surface-sunken);
  border-color: var(--f-color-border-subtle);
}

.f-text-input:hover:not(:disabled, .f-text-input--invalid) {
  border-color: var(--f-color-text-muted);
}
</style>
