# Folio

Folio est un design system Vue 3 sobre et éditorial, accessible par défaut, pensé pour des parcours à formulaires : paiement, multi-étapes, trois langues (FR, EN, ES) et états d'erreur.

> Statut : jalon 1, le socle. Les composants arrivent par jalons démontrables.

## Structure

```
packages/ui     @emmanuelplougoulm/folio : composants, tokens, Storybook
apps/           applications consommatrices (à venir : l'app banc d'essai)
```

## Principes

- **Natif d'abord.** Les champs de formulaire reposent sur les éléments HTML natifs (`input`, `select`, `fieldset`), pour l'autofill, le clavier et des locators `getByRole` fiables. Les primitives complexes (Dialog, Combobox, Tooltip, Toast) s'appuient sur [Reka UI](https://reka-ui.com).
- **Aucune fuite de style.** Aucun reset global ni sélecteur d'élément nu dans les composants. Toutes les valeurs passent par les tokens.
- **Aucune chaîne en dur.** Tout texte visible est fourni par props ou slots, pour que l'app traduise.
- **Testé à trois niveaux** : tests unitaires (Vitest), tests de composants dans le navigateur avec contrôle a11y (stories Storybook + axe), puis régression visuelle.

## Développement

Prérequis : Node 22 et pnpm 9.

```bash
pnpm install
```

```bash
pnpm storybook
```

```bash
pnpm check
```

`pnpm check` enchaîne le formatage, le lint (ESLint + Stylelint), le typecheck (`vue-tsc`), les tests et le build. La CI exécute la même commande.

## Licence

MIT
