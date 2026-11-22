export interface RenderedEmail {
  subject: string;
  /** Texte d'aperçu affiché par les messageries après l'objet. */
  preheader: string;
  html: string;
  /** Version texte (multipart/alternative) : lecteurs d'écran, clients sans HTML. */
  text: string;
}
