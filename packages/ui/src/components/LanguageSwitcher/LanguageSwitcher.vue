<script setup lang="ts">
import type { Component } from 'vue';

export interface LanguageOption {
  /** Code BCP 47 : fr, en, es… */
  code: string;
  /** Nom de la langue dans cette langue même : Français, English, Español. */
  label: string;
  /** Attributs du lien vers la même page dans cette langue (href, ou to pour RouterLink). */
  link: Record<string, unknown>;
}

defineOptions({ name: 'FLanguageSwitcher' });

const {
  languages,
  current,
  label,
  as = 'a'
} = defineProps<{
  languages: readonly LanguageOption[];
  current: string;
  /** Nom de la navigation, dans la langue courante : « Langue ». */
  label: string;
  as?: 'a' | Component;
}>();
</script>

<template>
  <nav class="f-language-switcher" :aria-label="label">
    <ul class="f-language-switcher__list">
      <li v-for="language in languages" :key="language.code">
        <!-- lang : le libellé est prononcé dans sa langue ; hreflang : la cible aussi. -->
        <component
          :is="as"
          v-bind="language.link"
          :lang="language.code"
          :hreflang="language.code"
          :aria-current="language.code === current ? 'true' : undefined"
          :class="[
            'f-language-switcher__link',
            { 'f-language-switcher__link--current': language.code === current }
          ]"
          >{{ language.label }}</component
        >
      </li>
    </ul>
  </nav>
</template>

<style>
.f-language-switcher__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--f-space-4);
  padding: 0;
  margin: 0;
  font-family: var(--f-font-family-sans);
  list-style: none;
}

.f-language-switcher__link {
  color: var(--f-color-accent);
}

.f-language-switcher__link:focus-visible {
  outline: var(--f-focus-width) solid var(--f-color-focus);
  outline-offset: var(--f-focus-offset);
}

.f-language-switcher__link--current {
  font-weight: var(--f-font-weight-semibold);
  color: var(--f-color-text);
  text-decoration: none;
}
</style>
