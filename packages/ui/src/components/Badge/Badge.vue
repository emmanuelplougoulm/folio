<script setup lang="ts">
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

defineOptions({ name: 'FBadge' });

const { tone = 'neutral', size = 'md' } = defineProps<{
  /** Le ton double le texte, sans le remplacer : le libellé seul doit suffire. */
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}>();

defineSlots<{ default(): unknown }>();
</script>

<template>
  <!-- Pas de rôle live : un badge est un statut statique (voir FAlert ou useToast pour annoncer). -->
  <span :class="['f-badge', `f-badge--${tone}`, `f-badge--${size}`]"><slot /></span>
</template>

<style>
.f-badge {
  --f-badge-tone: var(--f-color-text-muted);
  --f-badge-bg: var(--f-color-surface-sunken);

  display: inline-flex;
  gap: var(--f-space-1);
  align-items: center;
  font-family: var(--f-font-family-sans);
  font-weight: var(--f-font-weight-semibold);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-badge-tone);
  white-space: nowrap;
  background: var(--f-badge-bg);
  border: var(--f-border-width-thin) solid currentcolor;
  border-radius: var(--f-radius-full);
}

.f-badge--sm {
  padding: 0 var(--f-space-2);
  font-size: var(--f-font-size-xs);
}

.f-badge--md {
  padding: var(--f-space-1) var(--f-space-3);
  font-size: var(--f-font-size-sm);
}

.f-badge--info {
  --f-badge-tone: var(--f-color-accent);
  --f-badge-bg: var(--f-color-accent-subtle);
}

.f-badge--success {
  --f-badge-tone: var(--f-color-success);
  --f-badge-bg: var(--f-color-success-subtle);
}

.f-badge--warning {
  --f-badge-tone: var(--f-color-warning);
  --f-badge-bg: var(--f-color-warning-subtle);
}

.f-badge--danger {
  --f-badge-tone: var(--f-color-danger);
  --f-badge-bg: var(--f-color-danger-subtle);
}
</style>
