import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { detectLocale, i18n, isLocale } from './i18n';
import { session } from './services/session';
import { draft, lastOrder } from './order/draft';
import { ORDER_STEPS } from './order/steps';
import { firstIncompleteStep } from './order/validation';

declare module 'vue-router' {
  interface RouteMeta {
    /** Clé i18n du titre de la page (WCAG 2.4.2). */
    titleKey?: string;
    requiresAuth?: boolean;
    /** Index de l'étape dans le tunnel de commande. */
    step?: number;
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: () => `/${detectLocale()}` },
    {
      path: '/:locale(fr|en|es)',
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('./pages/HomePage.vue'),
          meta: { titleKey: 'home.title' }
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('./pages/LoginPage.vue'),
          meta: { titleKey: 'login.title' }
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('./pages/AccountPage.vue'),
          meta: { titleKey: 'account.title', requiresAuth: true }
        },
        {
          path: 'order',
          component: () => import('./pages/order/OrderLayout.vue'),
          children: [
            { path: '', redirect: { name: 'order-offer' } },
            ...ORDER_STEPS.map((id, step) => ({
              path: id,
              name: `order-${id}`,
              component: {
                offer: () => import('./pages/order/OfferStep.vue'),
                delivery: () => import('./pages/order/DeliveryStep.vue'),
                review: () => import('./pages/order/ReviewStep.vue'),
                payment: () => import('./pages/order/PaymentStep.vue')
              }[id],
              meta: { titleKey: `order.steps.${id}`, step }
            }))
          ]
        },
        {
          path: 'order/confirmation',
          name: 'order-confirmation',
          component: () => import('./pages/order/ConfirmationPage.vue'),
          meta: { titleKey: 'order.confirmation.title' }
        },
        {
          path: 'outbox',
          name: 'outbox',
          component: () => import('./pages/OutboxPage.vue'),
          meta: { titleKey: 'outbox.title' }
        },
        {
          path: 'error',
          name: 'server-error',
          component: () => import('./pages/ServerErrorPage.vue'),
          meta: { titleKey: 'serverError.title' }
        },
        {
          // Point d'essai : déclenche une erreur de rendu (voir CrashPage.vue).
          path: '__crash',
          name: 'crash',
          component: () => import('./pages/CrashPage.vue')
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('./pages/NotFoundPage.vue'),
          meta: { titleKey: 'notFound.title' }
        }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: (to) => `/${detectLocale()}${to.path}` }
  ]
});

// La langue vient de l'URL : elle pilote vue-i18n et l'attribut lang du document.
router.beforeEach((to) => {
  const locale = to.params['locale'];
  if (isLocale(locale)) {
    i18n.global.locale.value = locale;
    document.documentElement.lang = locale;
  }
  if (to.meta.requiresAuth && !session.user.value) {
    return {
      name: 'login',
      params: { locale: isLocale(locale) ? locale : detectLocale() },
      query: { redirect: to.fullPath }
    };
  }
  // Tunnel : impossible de sauter une étape incomplète (lien direct, rechargement).
  if (to.meta.step !== undefined) {
    const allowed = firstIncompleteStep(draft);
    const target = ORDER_STEPS[allowed];
    if (to.meta.step > allowed && target) {
      return { name: `order-${target}`, params: to.params };
    }
  }
  if (to.name === 'order-confirmation' && !lastOrder.value) {
    return { name: 'home', params: to.params };
  }
  return true;
});

router.afterEach(async (to, from) => {
  const { t } = i18n.global;
  const page = to.meta.titleKey ? t(to.meta.titleKey) : '';
  document.title = page ? `${page} · ${t('app.name')}` : t('app.name');

  // Navigation dans l'app (pas le premier chargement) : focus sur le titre de la nouvelle
  // page, pour que le lecteur d'écran l'annonce et que le Tab reparte du haut du contenu.
  if (from.matched.length === 0 || to.path === from.path) return;
  await nextTick();
  const heading = document.querySelector<HTMLElement>('#main h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: false });
  }
});

/** Erreur imprévue (rendu, navigation) : page d'erreur dans la langue courante, sans écran blanc. */
export function showServerError(error: unknown) {
  console.error(error);
  const current = router.currentRoute.value;
  if (current.name === 'server-error') return;
  const locale = isLocale(current.params['locale'])
    ? current.params['locale']
    : detectLocale();
  void router.replace({
    name: 'server-error',
    params: { locale },
    query: current.name && current.name !== 'crash' ? { from: current.fullPath } : {}
  });
}

router.onError(showServerError);
