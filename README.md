# Folio

[![CI](https://github.com/emmanuelplougoulm/folio/actions/workflows/ci.yml/badge.svg)](https://github.com/emmanuelplougoulm/folio/actions/workflows/ci.yml)

Folio est un design system Vue 3 sobre et éditorial, accessible par défaut, pensé pour des parcours à formulaires : paiement, multi-étapes, trois langues (FR, EN, ES) et états d'erreur.

> Statut : 28 composants, construits au moment où un écran du banc d’essai en avait besoin (connexion, tunnel de commande, paiement, compte, erreurs, e-mails, processus versionné).

## Structure

```
packages/ui     @emmanuelplougoulm/folio : composants, tokens, Storybook
packages/emails @folio/emails : gabarits d'e-mails FR, EN et ES (HTML et texte)
apps/testbed    l'app banc d'essai (Vue, vue-router, vue-i18n FR/EN/ES)
```

## Principes

- **Natif d'abord.** Les champs de formulaire reposent sur les éléments HTML natifs (`input`, `select`, `fieldset`), pour l'autofill, le clavier et des locators `getByRole` fiables. Les primitives complexes (Dialog, Combobox, Tooltip, Toast) s'appuient sur [Reka UI](https://reka-ui.com).
- **Aucune fuite de style.** Aucun reset global ni sélecteur d'élément nu dans les composants. Toutes les valeurs passent par les tokens.
- **Aucune chaîne en dur.** Tout texte visible est fourni par props ou slots, pour que l'app traduise.
- **Testé à trois niveaux** : tests unitaires (Vitest), tests de composants dans le navigateur avec contrôle a11y (stories Storybook + axe), puis régression visuelle.

## Utilisation

```ts
import '@emmanuelplougoulm/folio/fonts.css'; // Source Serif 4 et Source Sans 3 (OFL)
import '@emmanuelplougoulm/folio/style.css'; // tokens et styles des composants
import '@emmanuelplougoulm/folio/base.css'; // optionnel : body et focus visible
```

Le thème suit `prefers-color-scheme`. On peut le forcer avec `data-theme="light"` ou `data-theme="dark"` sur `<html>`.

## Tokens

Les tokens sont écrits au format [DTCG](https://www.designtokens.org/) dans `packages/ui/tokens/`, puis générés par Style Dictionary en variables CSS `--f-*`. Ils sont aussi exportés en JSON (`@emmanuelplougoulm/folio/tokens/light.json` et `dark.json`).

- `primitives` : la palette brute (papier, encre, rouge, vert, ocre). Elle n'est jamais exportée en CSS.
- `semantic.light` / `semantic.dark` : les rôles (`color-text`, `color-accent`, `color-danger`…), seuls utilisés par les composants.
- `base` : espacement, rayons, typographie, ombres, durées, z-index et focus.

Un test vérifie que chaque paire texte/fond atteint 4,5:1 et chaque paire composant/fond 3:1, dans les deux thèmes.

## Processus versionné

Le tunnel de commande du banc d'essai existe en deux versions, décrites dans `apps/testbed/src/order/process.ts` :

- **v1** : offre, livraison, récapitulatif, paiement. L'e-mail de confirmation se saisit au paiement.
- **v2** (par défaut) : une étape « Coordonnées » s'ajoute avant le récapitulatif (FOL-214), et la livraison à domicile est offerte dès 30 € par mois (FOL-221).

Une commande garde la version avec laquelle elle a été commencée, même si la version par défaut change. Un brouillon enregistré avant les versions reprend en v1. Chaque changement renvoie à un ticket fictif, affiché sur la page `/:locale/process` (notes de version et réglage de démo). Le paramètre `?process=v1` choisit la version d'une commande qui n'a pas commencé.

## Développement

Prérequis : Node 22 et pnpm 9.

```bash
pnpm install
```

```bash
pnpm storybook
```

```bash
pnpm dev
```

`pnpm dev` lance le banc d'essai. Dans le workspace, il consomme les sources de Folio grâce à la condition d'export `folio-source` : pas de build préalable, et le rechargement à chaud traverse les deux packages.

```bash
pnpm check
```

`pnpm check` enchaîne la génération des tokens, le formatage, le lint (ESLint + Stylelint), le typecheck (`vue-tsc`), les tests, le build, la vérification du paquet publié (publint, et attw pour la résolution des types) et les tests e2e Playwright du banc d'essai (avec axe, en thème clair et sombre). La CI exécute la même commande.

## Versions et publication

Folio est versionné avec [Changesets](https://github.com/changesets/changesets). Le banc d'essai et les e-mails sont privés : ils ne sont ni versionnés ni publiés.

```bash
pnpm changeset
```

Chaque changement visible par les utilisateurs de Folio s'accompagne d'un changeset : le niveau semver et une description. Sur `main`, le workflow `release.yml` regroupe les changesets dans une PR « Version Packages » (version et CHANGELOG). Une fois cette PR fusionnée, il publie sur npm, avec provenance. Il lui faut le secret `NPM_TOKEN`.

Le paquet publié ne contient que `dist`, le README, le CHANGELOG et la licence. Ses exports n'exposent pas la condition `folio-source`, réservée au workspace (`publishConfig.exports`).

## Licence

MIT
