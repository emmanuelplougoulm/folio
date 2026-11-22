/** Textes des e-mails en français : schéma de référence pour les autres langues. */
export const fr = {
  common: {
    brand: "Banc d'essai Folio",
    footer:
      "Cet e-mail a été envoyé par le banc d'essai Folio, une application de démonstration. Aucune commande réelle n'a été passée.",
    greeting: 'Bonjour {name},',
    greetingAnonymous: 'Bonjour,'
  },
  orderConfirmation: {
    subject: 'Commande {number} confirmée',
    preheader: 'Merci pour votre commande. Voici son récapitulatif.',
    title: 'Merci pour votre commande',
    intro: 'Nous avons bien reçu votre paiement. Votre commande {number} est confirmée.',
    summary: 'Récapitulatif',
    offer: 'Offre',
    delivery: 'Livraison',
    date: 'Date',
    total: 'Total payé',
    cta: 'Suivre ma commande'
  },
  signInAlert: {
    subject: 'Nouvelle connexion à votre compte',
    preheader: "Une connexion vient d'avoir lieu sur votre compte.",
    title: 'Nouvelle connexion',
    intro:
      "Une connexion à votre compte a eu lieu le {date}. Si c'était vous, il n'y a rien à faire.",
    warning: "Si ce n'était pas vous, changez votre mot de passe dès maintenant.",
    cta: 'Voir mon compte'
  }
};

export type EmailMessages = typeof fr;
