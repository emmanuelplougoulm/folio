<script setup lang="ts">
defineOptions({ name: 'FEmptyState' });

const {
  title,
  description,
  headingLevel = 2
} = defineProps<{
  /** Une invitation plutôt qu'un constat : « Passez votre première commande ». */
  title: string;
  description?: string;
  headingLevel?: 2 | 3 | 4;
}>();

defineSlots<{
  /** Illustration décorative (aria-hidden conseillé). */
  illustration?(): unknown;
  actions?(): unknown;
}>();
</script>

<template>
  <div class="f-empty-state">
    <div
      v-if="$slots.illustration"
      class="f-empty-state__illustration"
      aria-hidden="true"
    >
      <slot name="illustration" />
    </div>
    <component :is="`h${headingLevel}`" class="f-empty-state__title">{{
      title
    }}</component>
    <p v-if="description" class="f-empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions" class="f-empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style>
.f-empty-state {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-2);
  align-items: center;
  padding: var(--f-space-10) var(--f-space-6);
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  text-align: center;
  border: var(--f-border-width-thin) dashed var(--f-color-border);
  border-radius: var(--f-radius-lg);
}

.f-empty-state__illustration {
  inline-size: 3rem;
  block-size: 3rem;
  margin-block-end: var(--f-space-2);
  color: var(--f-color-text-muted);
}

.f-empty-state__title {
  margin: 0;
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-xl);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-tight);
}

.f-empty-state__description {
  max-inline-size: 32rem;
  margin: 0;
  color: var(--f-color-text-muted);
}

.f-empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-3);
  justify-content: center;
  margin-block-start: var(--f-space-4);
}
</style>
