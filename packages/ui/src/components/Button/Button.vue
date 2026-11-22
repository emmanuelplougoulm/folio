<script setup lang="ts">
import type { Component } from 'vue';
import FVisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

defineOptions({ name: 'FButton' });

const {
  variant = 'secondary',
  size = 'md',
  type = 'button',
  as = 'button',
  disabled,
  loading,
  loadingLabel,
  block
} = defineProps<{
  /** Une seule action primary par vue. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Type natif, ignoré si le bouton est rendu comme lien. */
  type?: 'button' | 'submit' | 'reset';
  /** Élément ou composant rendu : « a », RouterLink… Les attributs (href, to) sont transmis. */
  as?: 'button' | 'a' | Component;
  disabled?: boolean;
  /** Affiche un indicateur, garde le focus et bloque les clics. */
  loading?: boolean;
  /** Texte annoncé pendant le chargement, par exemple « Connexion en cours ». */
  loadingLabel?: string;
  /** Occupe toute la largeur disponible. */
  block?: boolean;
}>();

const emit = defineEmits<{ click: [event: MouseEvent] }>();

defineSlots<{
  default(): unknown;
  iconStart?(): unknown;
  iconEnd?(): unknown;
}>();

const isNativeButton = as === 'button';

function onClick(event: MouseEvent) {
  if (loading || disabled) {
    event.preventDefault();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <component
    :is="as"
    :class="[
      'f-button',
      `f-button--${variant}`,
      `f-button--${size}`,
      { 'f-button--block': block, 'f-button--loading': loading }
    ]"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton && disabled ? true : undefined"
    :aria-disabled="(!isNativeButton && disabled) || loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <span v-if="loading" class="f-button__spinner" aria-hidden="true"></span>
    <span v-if="$slots.iconStart" class="f-button__icon" aria-hidden="true"
      ><slot name="iconStart"
    /></span>
    <span class="f-button__label"><slot /></span>
    <span v-if="$slots.iconEnd" class="f-button__icon" aria-hidden="true"
      ><slot name="iconEnd"
    /></span>
    <FVisuallyHidden v-if="loading && loadingLabel" role="status">{{
      loadingLabel
    }}</FVisuallyHidden>
  </component>
</template>

<style>
.f-button {
  box-sizing: border-box;
  display: inline-flex;
  gap: var(--f-space-2);
  align-items: center;
  justify-content: center;
  font-family: var(--f-font-family-sans);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-normal);
  color: var(--f-color-text);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border);
  border-radius: var(--f-radius-md);
  transition:
    background-color var(--f-duration-fast) var(--f-easing-standard),
    border-color var(--f-duration-fast) var(--f-easing-standard);
}

.f-button:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-button:hover {
  background: var(--f-color-surface-hover);
}

/* Variantes */
.f-button--primary {
  color: var(--f-color-on-accent);
  background: var(--f-color-accent);
  border-color: var(--f-color-accent);
}

.f-button--primary:hover {
  background: var(--f-color-accent-hover);
  border-color: var(--f-color-accent-hover);
}

.f-button--ghost {
  color: var(--f-color-accent);
  background: transparent;
  border-color: transparent;
}

.f-button--ghost:hover {
  background: var(--f-color-accent-subtle);
}

.f-button--danger {
  color: var(--f-color-on-danger);
  background: var(--f-color-danger);
  border-color: var(--f-color-danger);
}

.f-button--danger:hover {
  background: var(--f-color-danger-hover);
  border-color: var(--f-color-danger-hover);
}

/* Tailles */
.f-button--sm {
  padding: var(--f-space-1) var(--f-space-3);
  font-size: var(--f-font-size-sm);
}

.f-button--md {
  padding: var(--f-space-2) var(--f-space-4);
  font-size: var(--f-font-size-md);
}

.f-button--lg {
  padding: var(--f-space-3) var(--f-space-5);
  font-size: var(--f-font-size-lg);
}

.f-button--block {
  inline-size: 100%;
}

/* États */
.f-button:disabled,
.f-button[aria-disabled='true'] {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
  background: var(--f-color-surface-sunken);
  border-color: var(--f-color-border-subtle);
}

.f-button--loading,
.f-button--loading:hover {
  cursor: progress;
}

.f-button__icon {
  display: inline-flex;
  inline-size: 1em;
  block-size: 1em;
}

.f-button__icon > svg {
  inline-size: 100%;
  block-size: 100%;
  fill: currentcolor;
}

.f-button__spinner {
  inline-size: 1em;
  block-size: 1em;
  border: var(--f-border-width-thick) solid currentcolor;
  border-inline-end-color: transparent;
  border-radius: var(--f-radius-full);
  animation: f-button-spin 0.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .f-button__spinner {
    animation-duration: 2.4s;
  }
}

@keyframes f-button-spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
