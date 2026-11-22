<script setup lang="ts">
import { computed, provide, useId } from 'vue';
import { formFieldKey } from './context';

defineOptions({ name: 'FFormField' });

const { label, hint, error, required, disabled, id } = defineProps<{
  /** Libellé visible, relié au champ par for/id. */
  label: string;
  /** Aide affichée sous le libellé, reliée par aria-describedby. */
  hint?: string;
  /** Message d'erreur. Sa présence passe le champ en aria-invalid. */
  error?: string;
  /** Champ obligatoire : attribut required natif, plus un astérisque décoratif. */
  required?: boolean;
  disabled?: boolean;
  /** Identifiant du champ, généré par défaut. */
  id?: string;
}>();

defineSlots<{
  /** Le contrôle (FTextInput, FPasswordInput…). Les props du slot servent aux contrôles tiers. */
  default(props: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
    required: boolean;
  }): unknown;
}>();

const generatedId = useId();
const fieldId = computed(() => id ?? `f-field-${generatedId}`);
const hintId = computed(() => `${fieldId.value}-hint`);
const errorId = computed(() => `${fieldId.value}-error`);

const describedBy = computed(() => {
  const ids = [hint ? hintId.value : '', error ? errorId.value : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
});
const invalid = computed(() => Boolean(error));

provide(formFieldKey, {
  get id() {
    return fieldId.value;
  },
  describedBy,
  invalid,
  required: computed(() => required),
  disabled: computed(() => disabled)
});
</script>

<template>
  <div :class="['f-form-field', { 'f-form-field--invalid': invalid }]">
    <!-- Astérisque hors du <label> : le nom accessible et getByLabelText restent exacts. -->
    <div class="f-form-field__label-row">
      <label :for="fieldId" class="f-form-field__label">{{ label }}</label>
      <span v-if="required" class="f-form-field__required" aria-hidden="true">*</span>
    </div>
    <p v-if="hint" :id="hintId" class="f-form-field__hint">{{ hint }}</p>
    <slot
      :id="fieldId"
      :described-by="describedBy"
      :invalid="invalid"
      :required="required"
    />
    <p v-if="error" :id="errorId" class="f-form-field__error">
      <svg class="f-form-field__error-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 9.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM8 4a.9.9 0 0 0-.9.9v3.7a.9.9 0 1 0 1.8 0V4.9A.9.9 0 0 0 8 4Z"
        />
      </svg>
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<style>
.f-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-1);
  font-family: var(--f-font-family-sans);
}

.f-form-field__label {
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-color-text);
}

.f-form-field__label-row {
  display: flex;
  gap: var(--f-space-1);
  align-items: baseline;
}

/* Astérisque décoratif : l'obligation est portée par required, pas par le nom accessible. */
.f-form-field__required {
  font-size: var(--f-font-size-sm);
  color: var(--f-color-danger);
}

.f-form-field__hint {
  margin: 0;
  font-size: var(--f-font-size-sm);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-color-text-muted);
}

.f-form-field__error {
  display: flex;
  gap: var(--f-space-1);
  align-items: flex-start;
  margin: 0;
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-color-danger);
}

.f-form-field__error-icon {
  flex: none;
  inline-size: 1em;
  block-size: 1em;
  margin-block-start: 0.2em;
  fill: currentcolor;
}
</style>
