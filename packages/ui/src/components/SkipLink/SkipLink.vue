<script setup lang="ts">
defineOptions({ name: 'FSkipLink' });

const { href = '#main' } = defineProps<{
  /** Ancre de la zone de contenu principal. Celle-ci doit accepter le focus (tabindex="-1"). */
  href?: string;
}>();

defineSlots<{
  /** Libellé du lien, par exemple « Aller au contenu ». */
  default(): unknown;
}>();
</script>

<template>
  <a class="f-skip-link" :href="href"><slot /></a>
</template>

<style>
.f-skip-link {
  position: absolute;
  inset-block-start: var(--f-space-2);
  inset-inline-start: var(--f-space-4);
  z-index: var(--f-z-toast);
  padding: var(--f-space-2) var(--f-space-4);
  font-family: var(--f-font-family-sans);
  font-weight: var(--f-font-weight-medium);
  color: var(--f-color-on-accent);
  background: var(--f-color-accent);
  border-radius: var(--f-radius-md);
  transform: translateY(-200%);
}

.f-skip-link:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
  transform: none;
}
</style>
