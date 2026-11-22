# @emmanuelplougoulm/folio

Design system Vue 3 sobre et éditorial, accessible par défaut, pensé pour des parcours à formulaires : paiement, multi-étapes, plusieurs langues et états d'erreur.

- 28 composants. Les champs reposent sur les éléments HTML natifs ; Dialog, Combobox, Tooltip, Toast et Tabs s'appuient sur [Reka UI](https://reka-ui.com).
- Tokens [DTCG](https://www.designtokens.org/) : variables CSS `--f-*`, et JSON par thème.
- Thèmes clair et sombre, contrastes WCAG AA vérifiés par test.
- Aucune chaîne en dur : tout texte visible passe par props ou slots, pour que l'app traduise.

## Installation

```bash
pnpm add @emmanuelplougoulm/folio vue
```

Le paquet est en ESM uniquement et demande Vue 3.5 ou plus.

## Utilisation

```ts
import '@emmanuelplougoulm/folio/fonts.css'; // Source Serif 4 et Source Sans 3 (OFL)
import '@emmanuelplougoulm/folio/style.css'; // tokens et styles des composants
import '@emmanuelplougoulm/folio/base.css'; // optionnel : body et focus visible
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FButton, FFormField, FTextInput } from '@emmanuelplougoulm/folio';

const email = ref('');
</script>

<template>
  <FFormField id="email" label="Adresse e-mail" required>
    <FTextInput v-model="email" type="email" autocomplete="email" />
  </FFormField>
  <FButton variant="primary">Continuer</FButton>
</template>
```

Le thème suit `prefers-color-scheme`. On peut le forcer avec `data-theme="light"` ou `data-theme="dark"` sur `<html>`.

## Tokens en JSON

```ts
import light from '@emmanuelplougoulm/folio/tokens/light.json';
```

Utile pour ce qui ne lit pas le CSS : e-mails aux styles en ligne, outils de conformité.

## Versions

Folio suit [semver](https://semver.org/lang/fr/). Tant qu'il est en `0.x`, une rupture d'API donne une version mineure. Les changements sont décrits dans le [CHANGELOG](./CHANGELOG.md).

## Licence

MIT
