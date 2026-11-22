import type { EmailMessages } from './fr';

export const es: EmailMessages = {
  common: {
    brand: 'Banco de pruebas Folio',
    footer:
      'Este correo lo ha enviado el banco de pruebas Folio, una aplicación de demostración. No se ha realizado ningún pedido real.',
    greeting: 'Hola, {name}:',
    greetingAnonymous: 'Hola:'
  },
  orderConfirmation: {
    subject: 'Pedido {number} confirmado',
    preheader: 'Gracias por tu pedido. Aquí tienes el resumen.',
    title: 'Gracias por tu pedido',
    intro: 'Hemos recibido tu pago. Tu pedido {number} está confirmado.',
    summary: 'Resumen',
    offer: 'Oferta',
    delivery: 'Entrega',
    date: 'Fecha',
    total: 'Total pagado',
    cta: 'Seguir mi pedido'
  },
  signInAlert: {
    subject: 'Nuevo inicio de sesión en tu cuenta',
    preheader: 'Se acaba de iniciar sesión en tu cuenta.',
    title: 'Nuevo inicio de sesión',
    intro:
      'Se ha iniciado sesión en tu cuenta el {date}. Si has sido tú, no tienes que hacer nada.',
    warning: 'Si no has sido tú, cambia tu contraseña ahora mismo.',
    cta: 'Ver mi cuenta'
  }
};
