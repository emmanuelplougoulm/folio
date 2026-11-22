<script setup lang="ts">
export interface DescriptionItem {
  term: string;
  details: string;
}

defineOptions({ name: 'FDescriptionList' });

const { items, layout = 'inline' } = defineProps<{
  items: readonly DescriptionItem[];
  /** « inline » : terme et valeur sur une ligne (montants). « stacked » : valeur sous le terme. */
  layout?: 'inline' | 'stacked';
}>();

defineSlots<{
  /** Rendu personnalisé d'une valeur. */
  details?(props: { item: DescriptionItem; index: number }): unknown;
}>();
</script>

<template>
  <dl :class="['f-description-list', `f-description-list--${layout}`]">
    <div v-for="(item, index) in items" :key="item.term" class="f-description-list__row">
      <dt class="f-description-list__term">{{ item.term }}</dt>
      <dd class="f-description-list__details">
        <slot name="details" :item="item" :index="index">{{ item.details }}</slot>
      </dd>
    </div>
  </dl>
</template>

<style>
.f-description-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: var(--f-font-family-sans);
}

.f-description-list__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-1) var(--f-space-4);
  padding-block: var(--f-space-2);
  border-block-end: var(--f-border-width-thin) solid var(--f-color-border-subtle);
}

.f-description-list__row:last-child {
  border-block-end: 0;
}

.f-description-list__term {
  color: var(--f-color-text-muted);
}

.f-description-list__details {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--f-color-text);
}

.f-description-list--inline .f-description-list__row {
  align-items: baseline;
  justify-content: space-between;
}

.f-description-list--inline .f-description-list__details {
  font-weight: var(--f-font-weight-medium);
  text-align: end;
}

.f-description-list--stacked .f-description-list__row {
  flex-direction: column;
}
</style>
