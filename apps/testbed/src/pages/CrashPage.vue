<script setup lang="ts">
/**
 * Point d'essai du banc : cette page lève une erreur au rendu, pour vérifier
 * que l'app bascule sur la page d'erreur au lieu d'afficher un écran blanc.
 */
throw new Error('Erreur volontaire du banc d’essai (/__crash)');
</script>

<template>
  <div></div>
</template>
