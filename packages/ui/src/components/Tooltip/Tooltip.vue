<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger
} from 'reka-ui';

defineOptions({ name: 'FTooltip' });

const { content, side = 'top' } = defineProps<{
  /** Texte d'appoint. Jamais une information indispensable : elle doit rester visible ailleurs. */
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}>();

defineSlots<{
  /** Déclencheur focusable (bouton, lien) : le tooltip s'ouvre au survol et au focus. */
  default(): unknown;
}>();
</script>

<template>
  <!-- Reka UI : role=tooltip, aria-describedby sur le déclencheur, Échap, survol de la bulle. -->
  <TooltipProvider :delay-duration="300">
    <TooltipRoot>
      <TooltipTrigger as-child><slot /></TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="6"
          :collision-padding="8"
          class="f-tooltip"
        >
          {{ content }}
          <TooltipArrow class="f-tooltip__arrow" :width="12" :height="6" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
.f-tooltip {
  z-index: var(--f-z-toast);
  max-inline-size: 18rem;
  padding: var(--f-space-2) var(--f-space-3);
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-sm);
  line-height: var(--f-font-line-height-snug);
  color: var(--f-color-bg);
  background: var(--f-color-text);
  border-radius: var(--f-radius-md);
  box-shadow: var(--f-shadow-lg);
}

.f-tooltip__arrow {
  fill: var(--f-color-text);
}
</style>
