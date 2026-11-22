<script setup lang="ts">
import type { Component } from 'vue';

export interface BreadcrumbItem {
  label: string;
  /** Attributs du lien (href, ou to pour RouterLink). Absent pour la page courante. */
  link?: Record<string, unknown>;
}

defineOptions({ name: 'FBreadcrumb' });

const {
  items,
  label,
  as = 'a'
} = defineProps<{
  items: readonly BreadcrumbItem[];
  /** Nom de la navigation, par exemple « Fil d'Ariane ». */
  label: string;
  /** Composant de lien : « a » ou RouterLink. */
  as?: 'a' | Component;
}>();
</script>

<template>
  <nav class="f-breadcrumb" :aria-label="label">
    <ol class="f-breadcrumb__list">
      <li v-for="(item, index) in items" :key="item.label" class="f-breadcrumb__item">
        <component
          :is="as"
          v-if="item.link && index < items.length - 1"
          v-bind="item.link"
          class="f-breadcrumb__link"
          >{{ item.label }}</component
        >
        <span v-else class="f-breadcrumb__current" aria-current="page">{{
          item.label
        }}</span>
      </li>
    </ol>
  </nav>
</template>

<style>
.f-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-1) var(--f-space-2);
  align-items: center;
  padding: 0;
  margin: 0;
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-sm);
  list-style: none;
}

.f-breadcrumb__item {
  display: inline-flex;
  gap: var(--f-space-2);
  align-items: center;
}

/* Séparateur décoratif en CSS : ignoré par les lecteurs d'écran. */
.f-breadcrumb__item + .f-breadcrumb__item::before {
  color: var(--f-color-text-muted);
  content: '/';
}

.f-breadcrumb__item:dir(rtl) + .f-breadcrumb__item::before {
  content: '\\';
}

.f-breadcrumb__link {
  color: var(--f-color-accent);
}

.f-breadcrumb__link:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-breadcrumb__current {
  color: var(--f-color-text-muted);
}
</style>
