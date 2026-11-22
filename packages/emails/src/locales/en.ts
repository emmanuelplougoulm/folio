import type { EmailMessages } from './fr';

export const en: EmailMessages = {
  common: {
    brand: 'Folio testbed',
    footer:
      'This email was sent by the Folio testbed, a demo application. No real order was placed.',
    greeting: 'Hello {name},',
    greetingAnonymous: 'Hello,'
  },
  orderConfirmation: {
    subject: 'Order {number} confirmed',
    preheader: "Thank you for your order. Here's your summary.",
    title: 'Thank you for your order',
    intro: "We've received your payment. Your order {number} is confirmed.",
    summary: 'Summary',
    offer: 'Plan',
    delivery: 'Delivery',
    date: 'Date',
    total: 'Total paid',
    cta: 'Track my order'
  },
  signInAlert: {
    subject: 'New sign-in to your account',
    preheader: 'Someone just signed in to your account.',
    title: 'New sign-in',
    intro:
      "Someone signed in to your account on {date}. If this was you, there's nothing to do.",
    warning: "If this wasn't you, change your password now.",
    cta: 'View my account'
  }
};
