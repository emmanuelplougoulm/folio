<script setup lang="ts">
defineOptions({ name: 'FVisuallyHidden' });

const { as = 'span' } = defineProps<{
  /** Élément HTML rendu. */
  as?: 'span' | 'div' | 'p' | 'label' | 'legend';
}>();

defineSlots<{
  /** Contenu lu par les technologies d'assistance, invisible à l'écran. */
  default(): unknown;
}>();
</script>

<template>
  <component :is="as" class="f-visually-hidden"><slot /></component>
</template>

<style>
.f-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}
</style>
