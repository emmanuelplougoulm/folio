<script setup lang="ts">
defineOptions({ name: 'FSkeleton' });

const {
  lines = 1,
  width = '100%',
  height = '1em',
  shape = 'text'
} = defineProps<{
  lines?: number;
  /** Largeur CSS de chaque ligne (la dernière est raccourcie). */
  width?: string;
  height?: string;
  shape?: 'text' | 'block';
}>();
</script>

<template>
  <!-- Décoratif : l'état « chargement » est annoncé par le conteneur (aria-busy, texte). -->
  <span :class="['f-skeleton', `f-skeleton--${shape}`]" aria-hidden="true">
    <span
      v-for="index in lines"
      :key="index"
      class="f-skeleton__line"
      :style="{
        inlineSize: lines > 1 && index === lines ? `calc(${width} * 0.6)` : width,
        blockSize: height
      }"
    ></span>
  </span>
</template>

<style>
.f-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-2);
}

.f-skeleton__line {
  display: block;
  max-inline-size: 100%;
  background: linear-gradient(
    90deg,
    var(--f-color-surface-sunken) 0%,
    var(--f-color-surface-hover) 50%,
    var(--f-color-surface-sunken) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--f-radius-sm);
  animation: f-skeleton-shimmer 1.4s ease-in-out infinite;
}

.f-skeleton--block .f-skeleton__line {
  border-radius: var(--f-radius-md);
}

@keyframes f-skeleton-shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .f-skeleton__line {
    animation: none;
  }
}
</style>
