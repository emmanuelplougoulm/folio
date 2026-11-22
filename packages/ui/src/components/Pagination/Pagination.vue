<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'FPagination' });

const {
  pageCount,
  label,
  previousLabel,
  nextLabel,
  pageLabel,
  siblings = 1
} = defineProps<{
  pageCount: number;
  /** Nom de la navigation, par exemple « Pagination des commandes ». */
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** Nom accessible d'un numéro : (3) => « Page 3 ». */
  pageLabel: (page: number) => string;
  /** Pages affichées de part et d'autre de la page courante. */
  siblings?: number;
}>();

/** Page courante, à partir de 1. */
const page = defineModel<number>('page', { default: 1 });

type Item = { type: 'page'; page: number } | { type: 'gap'; key: string };

/** 1 … 4 5 6 … 12 : toujours la première, la dernière et les voisines de la page courante. */
const items = computed<Item[]>(() => {
  const pages = new Set<number>([1, pageCount]);
  for (let p = page.value - siblings; p <= page.value + siblings; p++) {
    if (p >= 1 && p <= pageCount) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: Item[] = [];
  sorted.forEach((p, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && p - previous > 1)
      result.push({ type: 'gap', key: `gap-${String(p)}` });
    result.push({ type: 'page', page: p });
  });
  return result;
});

function go(target: number) {
  page.value = Math.min(Math.max(target, 1), pageCount);
}
</script>

<template>
  <nav v-if="pageCount > 1" class="f-pagination" :aria-label="label">
    <ul class="f-pagination__list">
      <li>
        <button
          type="button"
          class="f-pagination__control"
          :disabled="page <= 1"
          @click="go(page - 1)"
        >
          {{ previousLabel }}
        </button>
      </li>
      <li v-for="item in items" :key="item.type === 'page' ? item.page : item.key">
        <!-- Points de suspension en CSS : décoratifs, ignorés par les lecteurs d'écran. -->
        <span
          v-if="item.type === 'gap'"
          class="f-pagination__gap"
          aria-hidden="true"
        ></span>
        <button
          v-else
          type="button"
          :class="[
            'f-pagination__page',
            { 'f-pagination__page--current': item.page === page }
          ]"
          :aria-label="pageLabel(item.page)"
          :aria-current="item.page === page ? 'page' : undefined"
          @click="go(item.page)"
        >
          {{ item.page }}
        </button>
      </li>
      <li>
        <button
          type="button"
          class="f-pagination__control"
          :disabled="page >= pageCount"
          @click="go(page + 1)"
        >
          {{ nextLabel }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style>
.f-pagination__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-1);
  align-items: center;
  padding: 0;
  margin: 0;
  font-family: var(--f-font-family-sans);
  list-style: none;
}

.f-pagination__page,
.f-pagination__control {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  padding: var(--f-space-2) var(--f-space-3);
  font-family: inherit;
  font-size: var(--f-font-size-md);
  font-variant-numeric: tabular-nums;
  color: var(--f-color-accent);
  cursor: pointer;
  background: transparent;
  border: var(--f-border-width-thin) solid transparent;
  border-radius: var(--f-radius-md);
}

.f-pagination__page:focus-visible,
.f-pagination__control:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-pagination__page--current {
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-color-on-accent);
  background: var(--f-color-accent);
}

.f-pagination__control:disabled {
  color: var(--f-color-text-disabled);
  cursor: not-allowed;
}

.f-pagination__gap {
  padding-inline: var(--f-space-2);
  color: var(--f-color-text-muted);
}

.f-pagination__gap::after {
  content: '…';
}

.f-pagination__page:not(.f-pagination__page--current):hover,
.f-pagination__control:hover:not(:disabled) {
  background: var(--f-color-accent-subtle);
}
</style>
