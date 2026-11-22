<script setup lang="ts">
import { computed, ref } from 'vue';
import FTextInput from '../TextInput/TextInput.vue';
import { useFormField } from '../FormField/context';

defineOptions({ name: 'FPasswordInput', inheritAttrs: false });

const { showLabel, hideLabel, id } = defineProps<{
  /** Libellé du bouton quand le mot de passe est masqué, par exemple « Afficher ». */
  showLabel: string;
  /** Libellé du bouton quand le mot de passe est visible, par exemple « Masquer ». */
  hideLabel: string;
  id?: string;
}>();

const model = defineModel<string>({ default: '' });

const field = useFormField();
const visible = ref(false);
const input = ref<InstanceType<typeof FTextInput>>();
const inputId = computed(() => id ?? field?.id);

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="f-password-input">
    <FTextInput
      :id="inputId"
      ref="input"
      v-bind="$attrs"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="f-password-input__field"
      autocapitalize="off"
      spellcheck="false"
    />
    <button
      type="button"
      class="f-password-input__toggle"
      :aria-controls="inputId"
      :aria-pressed="visible ? 'true' : 'false'"
      @click="visible = !visible"
    >
      {{ visible ? hideLabel : showLabel }}
    </button>
  </div>
</template>

<style>
.f-password-input {
  position: relative;
  display: flex;
}

.f-password-input__field {
  padding-inline-end: var(--f-space-16);
}

.f-password-input__toggle {
  position: absolute;
  inset-block: var(--f-space-1);
  inset-inline-end: var(--f-space-1);
  padding: 0 var(--f-space-3);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-accent);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--f-radius-sm);
}

.f-password-input__toggle:hover {
  background: var(--f-color-accent-subtle);
}

.f-password-input__toggle:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: 0;
}
</style>
