# Changesets

Chaque changement de `@emmanuelplougoulm/folio` visible par ses utilisateurs s'accompagne d'un fichier de changeset, créé par :

```bash
pnpm changeset
```

On y choisit le niveau de version (semver) et on décrit le changement du point de vue de l'utilisateur. Le banc d'essai et les e-mails sont privés : ils ne sont ni versionnés ni publiés.

Tant que Folio est en `0.x`, une rupture d'API donne un `minor` et le reste un `patch`.
