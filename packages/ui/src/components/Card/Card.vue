<script setup lang="ts">
import { useId } from 'vue';

defineOptions({ name: 'FCard' });

const {
  as = 'section',
  title,
  headingLevel = 2
} = defineProps<{
  /** section (nommée par son titre), article, ou div pour un simple conteneur. */
  as?: 'section' | 'article' | 'div';
  title?: string;
  headingLevel?: 2 | 3 | 4;
}>();

defineSlots<{
  default?(): unknown;
  /** Action liée au titre, par exemple un lien « Modifier ». */
  headerAction?(): unknown;
  footer?(): unknown;
}>();

const titleId = `f-card-${useId()}`;
</script>

<template>
  <component :is="as" class="f-card" :aria-labelledby="title ? titleId : undefined">
    <header v-if="title || $slots.headerAction" class="f-card__header">
      <component
        :is="`h${headingLevel}`"
        v-if="title"
        :id="titleId"
        class="f-card__title"
        >{{ title }}</component
      >
      <div v-if="$slots.headerAction" class="f-card__header-action">
        <slot name="headerAction" />
      </div>
    </header>
    <div v-if="$slots.default" class="f-card__body"><slot /></div>
    <footer v-if="$slots.footer" class="f-card__footer"><slot name="footer" /></footer>
  </component>
</template>

<style>
.f-card {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-3);
  padding: var(--f-space-5);
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-radius: var(--f-radius-lg);
}

.f-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-2) var(--f-space-4);
  align-items: baseline;
  justify-content: space-between;
}

.f-card__title {
  margin: 0;
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-xl);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-tight);
}

.f-card__footer {
  padding-block-start: var(--f-space-3);
  border-block-start: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}
</style>
