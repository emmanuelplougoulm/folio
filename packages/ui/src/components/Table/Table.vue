<script setup lang="ts">
import { useId } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
  /** « end » pour les montants et les nombres. */
  align?: 'start' | 'end';
  /** Colonne d'en-tête de ligne (th scope=row), par exemple un numéro de commande. */
  rowHeader?: boolean;
}

export type TableRow = Record<string, unknown>;

defineOptions({ name: 'FTable' });

const {
  caption,
  columns,
  rows,
  rowKey,
  hideCaption = false
} = defineProps<{
  /** Titre du tableau (caption), obligatoire : il nomme aussi la zone de défilement. */
  caption: string;
  columns: readonly TableColumn[];
  rows: readonly TableRow[];
  /** Clé unique d'une ligne. */
  rowKey: string;
  /** Masque visuellement la légende (elle reste lue). */
  hideCaption?: boolean;
}>();

defineSlots<{
  /** Rendu d'une cellule : `#cell="{ row, column, value }"`. */
  cell?(props: { row: TableRow; column: TableColumn; value: unknown }): unknown;
}>();

const captionId = `f-table-${useId()}`;
const display = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';
</script>

<template>
  <!-- Zone défilante focusable et nommée : atteignable au clavier quand le tableau déborde. -->
  <div class="f-table" role="region" :aria-labelledby="captionId" tabindex="0">
    <table class="f-table__table">
      <caption
        :id="captionId"
        :class="['f-table__caption', { 'f-table__caption--hidden': hideCaption }]"
      >
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="['f-table__head', `f-table__cell--${column.align ?? 'start'}`]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="display(row[rowKey])" class="f-table__row">
          <component
            :is="column.rowHeader ? 'th' : 'td'"
            v-for="column in columns"
            :key="column.key"
            :scope="column.rowHeader ? 'row' : undefined"
            :class="[
              'f-table__cell',
              `f-table__cell--${column.align ?? 'start'}`,
              { 'f-table__cell--row-header': column.rowHeader }
            ]"
          >
            <slot name="cell" :row="row" :column="column" :value="row[column.key]">{{
              display(row[column.key])
            }}</slot>
          </component>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.f-table {
  max-inline-size: 100%;
  overflow-x: auto;
  border: var(--f-border-width-thin) solid var(--f-color-border-subtle);
  border-radius: var(--f-radius-lg);
}

.f-table:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-table__table {
  inline-size: 100%;
  font-family: var(--f-font-family-sans);
  font-size: var(--f-font-size-md);
  color: var(--f-color-text);
  border-collapse: collapse;
  background: var(--f-color-surface);
}

.f-table__caption {
  padding: var(--f-space-4) var(--f-space-4) var(--f-space-2);
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-lg);
  font-weight: var(--f-font-weight-medium);
  text-align: start;
}

.f-table__caption--hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}

.f-table__head {
  padding: var(--f-space-3) var(--f-space-4);
  font-size: var(--f-font-size-sm);
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-color-text-muted);
  white-space: nowrap;
  background: var(--f-color-surface-sunken);
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border);
}

.f-table__cell {
  padding: var(--f-space-3) var(--f-space-4);
  font-weight: var(--f-font-weight-regular);
  vertical-align: middle;
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}

.f-table__row:last-child .f-table__cell {
  border-block-end: 0;
}

.f-table__cell--row-header {
  font-weight: var(--f-font-weight-medium);
}

.f-table__cell--start {
  text-align: start;
}

.f-table__cell--end {
  font-variant-numeric: tabular-nums;
  text-align: end;
}
</style>
