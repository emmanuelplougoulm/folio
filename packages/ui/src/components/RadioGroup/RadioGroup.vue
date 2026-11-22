<script setup lang="ts" generic="T extends string">
import { computed, useId } from 'vue';

export interface RadioOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
}

defineOptions({ name: 'FRadioGroup' });

const {
  legend,
  options,
  hint,
  error,
  required,
  name,
  id,
  variant = 'default'
} = defineProps<{
  /** Question posée par le groupe, rendue en <legend>. */
  legend: string;
  options: readonly RadioOption<T>[];
  hint?: string;
  error?: string;
  required?: boolean;
  /** Nom commun des boutons radio, généré par défaut. */
  name?: string;
  /** Id du groupe. Le premier bouton reçoit `${id}-0`, cible des liens d'erreur. */
  id?: string;
  /** « card » : options encadrées, pour des choix riches (offre, livraison). */
  variant?: 'default' | 'card';
}>();

const model = defineModel<T | undefined>();

defineSlots<{
  /** Contenu additionnel d'une option, par exemple un prix. */
  option?(props: { option: RadioOption<T>; checked: boolean }): unknown;
}>();

const generated = useId();
const groupId = computed(() => id ?? `f-radio-${generated}`);
const groupName = computed(() => name ?? groupId.value);
const hintId = computed(() => `${groupId.value}-hint`);
const errorId = computed(() => `${groupId.value}-error`);
const describedBy = computed(
  () =>
    [hint ? hintId.value : '', error ? errorId.value : ''].filter(Boolean).join(' ') ||
    undefined
);
</script>

<template>
  <fieldset
    :id="groupId"
    :class="[
      'f-radio-group',
      `f-radio-group--${variant}`,
      { 'f-radio-group--invalid': error }
    ]"
    :aria-describedby="describedBy"
  >
    <legend
      :class="['f-radio-group__legend', { 'f-radio-group__legend--required': required }]"
    >
      {{ legend }}
    </legend>
    <p v-if="hint" :id="hintId" class="f-radio-group__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="f-radio-group__error">{{ error }}</p>
    <div class="f-radio-group__options">
      <div
        v-for="(option, index) in options"
        :key="option.value"
        :class="[
          'f-radio-group__option',
          {
            'f-radio-group__option--checked': model === option.value,
            'f-radio-group__option--disabled': option.disabled
          }
        ]"
      >
        <input
          :id="`${groupId}-${index}`"
          v-model="model"
          class="f-radio-group__input"
          type="radio"
          :name="groupName"
          :value="option.value"
          :required="required"
          :disabled="option.disabled"
          :aria-describedby="
            option.description ? `${groupId}-${index}-description` : undefined
          "
          :aria-invalid="error ? 'true' : undefined"
        />
        <div class="f-radio-group__text">
          <label :for="`${groupId}-${index}`" class="f-radio-group__label">{{
            option.label
          }}</label>
          <p
            v-if="option.description"
            :id="`${groupId}-${index}-description`"
            class="f-radio-group__description"
          >
            {{ option.description }}
          </p>
        </div>
        <div v-if="$slots.option" class="f-radio-group__extra">
          <slot name="option" :option="option" :checked="model === option.value" />
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style>
.f-radio-group {
  min-inline-size: 0;
  padding: 0;
  margin: 0;
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  border: 0;
}

.f-radio-group--invalid {
  padding-inline-start: var(--f-space-3);
  border-inline-start: var(--f-space-1) solid var(--f-color-danger);
}

.f-radio-group__legend {
  padding: 0;
  margin-block-end: var(--f-space-2);
  font-size: var(--f-font-size-md);
  font-weight: var(--f-font-weight-semibold);
}

.f-radio-group__legend--required::after {
  margin-inline-start: var(--f-space-1);
  color: var(--f-color-danger);
  content: '*';
}

.f-radio-group__hint {
  margin: 0 0 var(--f-space-2);
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-radio-group__error {
  margin: 0 0 var(--f-space-2);
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-danger);
}

.f-radio-group__options {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-2);
}

.f-radio-group__option {
  position: relative;
  display: flex;
  gap: var(--f-space-3);
  align-items: flex-start;
}

.f-radio-group__input {
  flex: none;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  margin: 0.125rem 0 0;
  accent-color: var(--f-color-accent);
  cursor: pointer;
}

.f-radio-group__input:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-radio-group__text {
  flex: 1;
  min-inline-size: 0;
}

.f-radio-group__label {
  line-height: var(--f-font-line-height-normal);
  cursor: pointer;
}

.f-radio-group__description {
  margin: 0;
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-radio-group__option--disabled .f-radio-group__label {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
}

/* Variante carte : toute la carte est cliquable via l'étirement du label. */
.f-radio-group--card .f-radio-group__option {
  padding: var(--f-space-4);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-lg);
}

.f-radio-group--card .f-radio-group__label {
  font-weight: var(--f-font-weight-medium);
}

.f-radio-group--card .f-radio-group__label::after {
  position: absolute;
  inset: 0;
  content: '';
}

.f-radio-group--card .f-radio-group__option--checked {
  background: var(--f-color-accent-subtle);
  border-color: var(--f-color-accent);
  box-shadow: inset 0 0 0 var(--f-border-width-thin) var(--f-color-accent);
}

.f-radio-group--card .f-radio-group__option:has(.f-radio-group__input:focus-visible) {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-radio-group--card .f-radio-group__input:focus-visible {
  outline: none;
}
</style>
