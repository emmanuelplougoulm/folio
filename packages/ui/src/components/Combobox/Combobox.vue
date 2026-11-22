<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport
} from 'reka-ui';
import { useFormField } from '../FormField/context';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Texte secondaire, aussi pris en compte par la recherche. */
  description?: string;
}

defineOptions({ name: 'FCombobox' });

// Booléens à undefined par défaut : absents, ils héritent de FFormField.
const {
  options,
  emptyLabel,
  toggleLabel,
  placeholder,
  id,
  invalid = undefined,
  required = undefined,
  disabled = undefined
} = defineProps<{
  options: readonly ComboboxOption[];
  /** Message quand aucune option ne correspond : « Aucun point relais trouvé ». */
  emptyLabel: string;
  /** Nom du bouton qui ouvre la liste : « Afficher les points relais ». */
  toggleLabel: string;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}>();

const model = defineModel<string | undefined>();

const field = useFormField();
const search = ref('');
const open = ref(false);
const isInvalid = computed(() => invalid ?? field?.invalid.value ?? false);

/** Recherche insensible à la casse et aux accents : « sevilla » trouve « Sevilla », « epicerie » « Épicerie ». */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const filtered = computed(() => {
  const term = normalize(search.value.trim());
  const selected = options.find((option) => option.value === model.value);
  // Champ qui affiche l'option choisie : toute la liste reste proposée.
  if (!term || (selected && search.value === selected.label)) return options;
  return options.filter((option) =>
    normalize(`${option.label} ${option.description ?? ''}`).includes(term)
  );
});

const labelOf = (value: unknown) =>
  options.find((option) => option.value === value)?.label ?? '';
</script>

<template>
  <!-- Reka UI : role=combobox, listbox, aria-expanded, aria-activedescendant, flèches, Échap.
       Liste fermée : aria-activedescendant retiré, sinon il pointe vers une option disparue. -->
  <ComboboxRoot
    v-model="model"
    v-model:open="open"
    :ignore-filter="true"
    :disabled="disabled ?? field?.disabled.value ?? false"
    class="f-combobox"
  >
    <ComboboxAnchor
      :class="['f-combobox__anchor', { 'f-combobox__anchor--invalid': isInvalid }]"
    >
      <ComboboxInput
        :id="id ?? field?.id"
        v-model="search"
        class="f-combobox__input"
        :display-value="labelOf"
        :placeholder="placeholder"
        :required="required ?? field?.required.value ?? false"
        :aria-describedby="field?.describedBy.value"
        :aria-invalid="isInvalid ? 'true' : undefined"
        autocomplete="off"
        v-bind="open ? {} : { 'aria-activedescendant': undefined }"
      />
      <ComboboxTrigger class="f-combobox__trigger" :aria-label="toggleLabel">
        <svg viewBox="0 0 16 16" aria-hidden="true" class="f-combobox__chevron">
          <path
            d="M3.3 5.8a.9.9 0 0 1 1.3 0L8 9.2l3.4-3.4a.9.9 0 1 1 1.3 1.3l-4 4a.9.9 0 0 1-1.3 0l-4-4a.9.9 0 0 1 0-1.3Z"
          />
        </svg>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="4"
        :collision-padding="8"
        class="f-combobox__content"
      >
        <ComboboxViewport class="f-combobox__viewport">
          <!-- Liste vide : une option désactivée plutôt qu'un listbox sans option (invalide en ARIA). -->
          <div
            v-if="filtered.length === 0"
            role="option"
            aria-disabled="true"
            aria-selected="false"
            class="f-combobox__empty"
          >
            {{ emptyLabel }}
          </div>
          <ComboboxItem
            v-for="option in filtered"
            :key="option.value"
            :value="option.value"
            :text-value="option.label"
            class="f-combobox__item"
          >
            <span class="f-combobox__item-text">
              <span>{{ option.label }}</span>
              <span v-if="option.description" class="f-combobox__item-description">{{
                option.description
              }}</span>
            </span>
            <ComboboxItemIndicator class="f-combobox__indicator">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M13.2 4.3a.9.9 0 0 1 0 1.3l-6 6a.9.9 0 0 1-1.3 0l-3-3a.9.9 0 1 1 1.3-1.3L6.5 9.6l5.4-5.3a.9.9 0 0 1 1.3 0Z"
                />
              </svg>
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<style>
.f-combobox__anchor {
  position: relative;
  display: flex;
  align-items: center;
  font-family: var(--f-font-family-sans);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-md);
}

.f-combobox__anchor:focus-within {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-combobox__anchor--invalid {
  border-color: var(--f-color-danger);
  box-shadow: inset 0 0 0 var(--f-border-width-thin) var(--f-color-danger);
}

.f-combobox__input {
  flex: 1;
  min-inline-size: 0;
  min-block-size: 2.625rem;
  padding: var(--f-space-2) var(--f-space-3);
  font-family: inherit;
  font-size: var(--f-font-size-md);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  background: transparent;
  border: 0;
  outline: none;
}

.f-combobox__input::placeholder {
  color: var(--f-color-text-muted);
  opacity: 1;
}

.f-combobox__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  padding: 0;
  color: var(--f-color-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.f-combobox__chevron {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentcolor;
}

.f-combobox__content {
  z-index: var(--f-z-dropdown);
  box-sizing: border-box;

  /* Largeur du champ, fournie par Reka UI. */
  /* stylelint-disable-next-line custom-property-pattern */
  inline-size: var(--reka-combobox-trigger-width);
  max-block-size: 18rem;
  overflow: hidden;
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-radius: var(--f-radius-md);
  box-shadow: var(--f-shadow-lg);
}

.f-combobox__viewport {
  padding: var(--f-space-1);
}

.f-combobox__item {
  display: flex;
  gap: var(--f-space-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--f-space-2) var(--f-space-3);
  cursor: pointer;
  border-radius: var(--f-radius-sm);
}

.f-combobox__item[data-highlighted] {
  background: var(--f-color-accent-subtle);
}

.f-combobox__item-text {
  display: flex;
  flex-direction: column;
}

.f-combobox__item-description {
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-combobox__indicator {
  display: inline-flex;
  inline-size: 1rem;
  block-size: 1rem;
  color: var(--f-color-accent);
  fill: currentcolor;
}

.f-combobox__empty {
  padding: var(--f-space-3);
  color: var(--f-color-text-muted);
}
</style>
