<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue';

export interface ErrorSummaryItem {
  /** Id du champ en erreur : le lien y mène et y place le focus. */
  id: string;
  message: string;
}

defineOptions({ name: 'FErrorSummary' });

const {
  title,
  errors,
  autoFocus = true
} = defineProps<{
  /** Par exemple « Le formulaire contient 2 erreurs ». */
  title: string;
  errors: readonly ErrorSummaryItem[];
  /** Place le focus sur le récapitulatif quand des erreurs apparaissent (soumission). */
  autoFocus?: boolean;
}>();

const root = ref<HTMLElement>();
const titleId = `f-error-summary-${useId()}`;

function focus() {
  root.value?.focus();
}

function focusField(event: MouseEvent, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: 'center' });
}

watch(
  () => errors,
  async (current, previous) => {
    if (!autoFocus || current.length === 0 || current === previous) return;
    await nextTick();
    focus();
  },
  { immediate: true }
);

defineExpose({ focus });
</script>

<template>
  <!-- Région nommée par son titre et recevant le focus : le lecteur d'écran lit le titre et
       la liste à l'arrivée. Pas de role=alert, qui doublerait l'annonce. -->
  <section
    v-if="errors.length"
    ref="root"
    class="f-error-summary"
    tabindex="-1"
    :aria-labelledby="titleId"
  >
    <h2 :id="titleId" class="f-error-summary__title">{{ title }}</h2>
    <ul class="f-error-summary__list">
      <li v-for="error in errors" :key="error.id">
        <a
          class="f-error-summary__link"
          :href="`#${error.id}`"
          @click="focusField($event, error.id)"
          >{{ error.message }}</a
        >
      </li>
    </ul>
  </section>
</template>

<style>
.f-error-summary {
  padding: var(--f-space-4) var(--f-space-5);
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  background: var(--f-color-danger-subtle);
  border: var(--f-border-width-thin) solid var(--f-color-danger);
  border-inline-start-width: var(--f-space-1);
  border-radius: var(--f-radius-md);
}

.f-error-summary:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-error-summary__title {
  margin: 0;
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  font-weight: var(--f-font-weight-semibold);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-color-danger);
}

.f-error-summary__list {
  padding-inline-start: var(--f-space-5);
  margin: var(--f-space-2) 0 0;
}

.f-error-summary__link {
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-danger);
  text-decoration-thickness: from-font;
}

.f-error-summary__link:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}
</style>
