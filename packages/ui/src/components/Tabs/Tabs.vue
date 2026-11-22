<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';

export interface TabItem {
  value: string;
  label: string;
}

defineOptions({ name: 'FTabs' });

const { tabs, label } = defineProps<{
  tabs: readonly TabItem[];
  /** Nom de la liste d'onglets, par exemple « Sections du compte ». */
  label: string;
}>();

/** Valeur de l'onglet actif. */
const active = defineModel<string>({ required: true });

/** Un slot nommé par valeur d'onglet : `<template #orders>…</template>`. */
defineSlots<Record<string, (() => unknown) | undefined>>();
</script>

<template>
  <!-- Reka UI : rôles tablist/tab/tabpanel, flèches, Début et Fin ; activation automatique. -->
  <TabsRoot v-model="active" class="f-tabs">
    <TabsList class="f-tabs__list" :aria-label="label">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="f-tabs__tab"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      class="f-tabs__panel"
    >
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>

<style>
.f-tabs {
  font-family: var(--f-font-family-sans);
}

.f-tabs__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-1);
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}

.f-tabs__tab {
  padding: var(--f-space-3) var(--f-space-4);
  margin-block-end: calc(-1 * var(--f-border-width-thin));
  font-family: inherit;
  font-size: var(--f-font-size-md);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-block-end: var(--f-border-width-thick) solid transparent;
}

.f-tabs__tab:hover {
  color: var(--f-color-text);
}

.f-tabs__tab:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: calc(-1 * var(--f-focus-width));
}

.f-tabs__tab[data-state='active'] {
  color: var(--f-color-text);
  border-block-end-color: var(--f-color-accent);
}

.f-tabs__panel {
  padding-block-start: var(--f-space-6);
}

.f-tabs__panel:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}
</style>
