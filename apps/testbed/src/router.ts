import { createRouter, createWebHistory } from 'vue-router';
import { detectLocale, i18n, isLocale } from './i18n';
import { session } from './services/session';

declare module 'vue-router' {
  interface RouteMeta {
    /** Clé i18n du titre de la page (WCAG 2.4.2). */
    titleKey?: string;
    requiresAuth?: boolean;
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
  return true;
});

router.afterEach((to) => {
  const { t } = i18n.global;
  const page = to.meta.titleKey ? t(to.meta.titleKey) : '';
  document.title = page ? `${page} · ${t('app.name')}` : t('app.name');
});
