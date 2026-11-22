/** Une erreur de validation est une clé i18n, traduite au moment de l'affichage. */
export type ValidationError = string | undefined;

// Volontairement simple : le navigateur et le serveur restent juges en dernier ressort.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): ValidationError {
  if (!value.trim()) return 'validation.email.required';
  if (!EMAIL.test(value.trim())) return 'validation.email.format';
  return undefined;
}

export function validatePassword(value: string): ValidationError {
  return value ? undefined : 'validation.password.required';
}
