<script setup lang="ts">
import { provide, reactive } from 'vue';
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport
} from 'reka-ui';
import { toastKey, type ToastItem, type ToastOptions } from './context';

defineOptions({ name: 'FToastProvider' });

const {
  label,
  regionLabel,
  closeLabel,
  duration = 6000,
  limit = 3
} = defineProps<{
  /** Préfixe annoncé avec chaque notification, par exemple « Notification ». */
  label: string;
  /** Nom de la région des notifications ; « {hotkey} » est remplacé par le raccourci (F8). */
  regionLabel: string;
  /** Nom accessible du bouton qui ferme une notification. */
  closeLabel: string;
  duration?: number;
  /** Nombre maximal de notifications visibles. */
  limit?: number;
}>();

defineSlots<{ default(): unknown }>();

const items = reactive<ToastItem[]>([]);
let nextId = 1;

function show(options: ToastOptions): number {
  const id = nextId++;
  items.push({
    id,
    title: options.title,
    description: options.description,
    tone: options.tone ?? 'info',
    duration: options.duration,
    open: true
  });
  while (items.filter((item) => item.open).length > limit) {
    const oldest = items.find((item) => item.open);
    if (oldest) oldest.open = false;
  }
  return id;
}

function dismiss(id: number) {
  const item = items.find((candidate) => candidate.id === id);
  if (item) item.open = false;
}

/** Retire la notification une fois son animation de sortie terminée. */
function onOpenChange(id: number, open: boolean) {
  if (open) return;
  setTimeout(() => {
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) items.splice(index, 1);
  }, 200);
}

provide(toastKey, { show, dismiss });
</script>

<template>
  <ToastProvider :label="label" :duration="duration" swipe-direction="right">
    <slot />
    <!-- Une erreur est annoncée tout de suite (foreground) ; les autres attendent (background). -->
    <ToastRoot
      v-for="item in items"
      :key="item.id"
      v-model:open="item.open"
      :type="item.tone === 'danger' ? 'foreground' : 'background'"
      :duration="item.duration"
      :class="['f-toast', `f-toast--${item.tone}`]"
      @update:open="(open: boolean) => onOpenChange(item.id, open)"
    >
      <div class="f-toast__body">
        <ToastTitle class="f-toast__title">{{ item.title }}</ToastTitle>
        <ToastDescription v-if="item.description" class="f-toast__description">{{
          item.description
        }}</ToastDescription>
      </div>
      <ToastClose class="f-toast__close" :aria-label="closeLabel">
        <svg viewBox="0 0 16 16" aria-hidden="true" class="f-toast__close-icon">
          <path
            d="M4.1 4.1a.9.9 0 0 1 1.3 0L8 6.7l2.6-2.6a.9.9 0 1 1 1.3 1.3L9.3 8l2.6 2.6a.9.9 0 1 1-1.3 1.3L8 9.3l-2.6 2.6a.9.9 0 1 1-1.3-1.3L6.7 8 4.1 5.4a.9.9 0 0 1 0-1.3Z"
          />
        </svg>
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="f-toast-viewport"
      :label="(hotkey: string) => regionLabel.replace('{hotkey}', hotkey)"
    />
  </ToastProvider>
</template>

<style>
.f-toast-viewport {
  position: fixed;
  inset-block-end: 0;
  inset-inline-end: 0;
  z-index: var(--f-z-toast);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--f-space-3);
  inline-size: min(24rem, 100vw);
  max-block-size: 100dvh;
  padding: var(--f-space-4);
  margin: 0;
  list-style: none;
  outline: none;
}

.f-toast {
  --f-toast-tone: var(--f-color-accent);

  box-sizing: border-box;
  display: flex;
  gap: var(--f-space-3);
  align-items: flex-start;
  padding: var(--f-space-4);
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-inline-start: var(--f-space-1) solid var(--f-toast-tone);
  border-radius: var(--f-radius-md);
  box-shadow: var(--f-shadow-lg);
}

.f-toast:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-toast--success {
  --f-toast-tone: var(--f-color-success);
}

.f-toast--warning {
  --f-toast-tone: var(--f-color-warning);
}

.f-toast--danger {
  --f-toast-tone: var(--f-color-danger);
}

.f-toast__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--f-space-1);
  min-inline-size: 0;
}

.f-toast__title {
  font-weight: var(--f-font-weight-semibold);
}

.f-toast__description {
  font-size: var(--f-font-size-sm);
  color: var(--f-color-text-muted);
}

.f-toast__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: 2rem;
  block-size: 2rem;
  padding: 0;
  margin: calc(-1 * var(--f-space-1));
  color: var(--f-color-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--f-radius-md);
}

.f-toast__close:hover {
  color: var(--f-color-text);
  background: var(--f-color-surface-hover);
}

.f-toast__close:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: 0;
}

.f-toast__close-icon {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentcolor;
}

.f-toast[data-state='open'] {
  animation: f-toast-in var(--f-duration-base) var(--f-easing-standard);
}

.f-toast[data-state='closed'] {
  animation: f-toast-out var(--f-duration-fast) var(--f-easing-standard);
}

.f-toast[data-swipe='move'] {
  /* Variable posée par Reka UI pendant le glissement. */
  /* stylelint-disable-next-line custom-property-pattern */
  transform: translateX(var(--reka-toast-swipe-move-x));
}

@keyframes f-toast-in {
  from {
    opacity: 0;
    transform: translateY(var(--f-space-4));
  }
}

@keyframes f-toast-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .f-toast[data-state='open'],
  .f-toast[data-state='closed'] {
    animation: none;
  }
}
</style>
