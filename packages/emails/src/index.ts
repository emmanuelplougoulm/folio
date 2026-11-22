import type { EmailLocale } from './i18n';
import {
  orderConfirmation,
  type OrderConfirmationData
} from './templates/orderConfirmation';
import { signInAlert, type SignInAlertData } from './templates/signInAlert';
import type { RenderedEmail } from './types';

export type { EmailLocale } from './i18n';
export type { RenderedEmail } from './types';
export type { OrderConfirmationData } from './templates/orderConfirmation';
export type { SignInAlertData } from './templates/signInAlert';

export type EmailRequest =
  | { template: 'order-confirmation'; data: OrderConfirmationData }
  | { template: 'sign-in-alert'; data: SignInAlertData };

export type EmailTemplate = EmailRequest['template'];

/** Rend un e-mail dans la langue demandée : objet, pré-en-tête, HTML et texte. */
export function renderEmail(locale: EmailLocale, request: EmailRequest): RenderedEmail {
  switch (request.template) {
    case 'order-confirmation':
      return orderConfirmation(locale, request.data);
    case 'sign-in-alert':
      return signInAlert(locale, request.data);
  }
}
