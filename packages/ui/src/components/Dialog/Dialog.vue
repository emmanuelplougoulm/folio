<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui';

defineOptions({ name: 'FDialog' });

const {
  title,
  description,
  closeLabel,
  dismissible = true
} = defineProps<{
  title: string;
  description?: string;
  /** Nom accessible du bouton de fermeture, par exemple « Fermer ». */
  closeLabel: string;
  /**
   * Fermeture par Échap, clic à l'extérieur et bouton ×. À désactiver pendant une opération
   * qui ne doit pas être interrompue.
   */
  dismissible?: boolean;
}>();

const emit = defineEmits<{
  /** Fermeture demandée par l'utilisateur (Échap, extérieur, ×), pas par l'app. */
  dismiss: [];
}>();

const open = defineModel<boolean>('open', { default: false });

defineSlots<{
  default?(): unknown;
  footer?(): unknown;
}>();

function onOpenChange(value: boolean) {
  if (!value && !dismissible) return;
  open.value = value;
  if (!value) emit('dismiss');
}
</script>

<template>
  <!-- Reka UI : role=dialog, aria-modal, piège à focus, Échap et retour du focus au déclencheur. -->
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="f-dialog__overlay" />
      <DialogContent
        class="f-dialog"
        v-bind="description ? {} : { 'aria-describedby': undefined }"
        @interact-outside="(event: Event) => !dismissible && event.preventDefault()"
        @escape-key-down="(event: Event) => !dismissible && event.preventDefault()"
      >
        <header class="f-dialog__header">
          <DialogTitle class="f-dialog__title">{{ title }}</DialogTitle>
          <DialogClose
            v-if="dismissible"
            class="f-dialog__close"
            :aria-label="closeLabel"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" class="f-dialog__close-icon">
              <path
                d="M4.1 4.1a.9.9 0 0 1 1.3 0L8 6.7l2.6-2.6a.9.9 0 1 1 1.3 1.3L9.3 8l2.6 2.6a.9.9 0 1 1-1.3 1.3L8 9.3l-2.6 2.6a.9.9 0 1 1-1.3-1.3L6.7 8 4.1 5.4a.9.9 0 0 1 0-1.3Z"
              />
            </svg>
          </DialogClose>
        </header>
        <DialogDescription v-if="description" class="f-dialog__description">{{
          description
        }}</DialogDescription>
        <div v-if="$slots.default" class="f-dialog__body"><slot /></div>
        <footer v-if="$slots.footer" class="f-dialog__footer">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
.f-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--f-z-overlay);
  background: var(--f-color-overlay);
}

.f-dialog {
  position: fixed;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  z-index: var(--f-z-dialog);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--f-space-4);
  inline-size: min(32rem, calc(100vw - 2 * var(--f-space-4)));
  max-block-size: calc(100dvh - 2 * var(--f-space-4));
  padding: var(--f-space-6);
  overflow-y: auto;
  font-family: var(--f-font-family-sans);
  color: var(--f-color-text);
  background: var(--f-color-surface);
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-radius: var(--f-radius-lg);
  box-shadow: var(--f-shadow-lg);
  transform: translate(-50%, -50%);
}

.f-dialog:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-dialog__header {
  display: flex;
  gap: var(--f-space-4);
  align-items: flex-start;
  justify-content: space-between;
}

.f-dialog__title {
  margin: 0;
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-xl);
  font-weight: var(--f-font-weight-medium);
  line-height: var(--f-font-line-height-tight);
}

.f-dialog__description {
  margin: 0;
  color: var(--f-color-text-muted);
}

.f-dialog__close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  padding: 0;
  margin: calc(-1 * var(--f-space-2));
  color: var(--f-color-text-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--f-radius-md);
}

.f-dialog__close:hover {
  color: var(--f-color-text);
  background: var(--f-color-surface-hover);
}

.f-dialog__close:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: 0;
}

.f-dialog__close-icon {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  fill: currentcolor;
}

.f-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-3);
  justify-content: flex-end;
}
</style>
