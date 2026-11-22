import { createRouter, createWebHistory } from 'vue-router';
import { detectLocale, i18n, isLocale } from './i18n';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: () => `/${detectLocale()}` },
    {
      path: '/:locale(fr|en|es)',
      children: [
        { path: '', name: 'home', component: () => import('./pages/HomePage.vue') },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('./pages/NotFoundPage.vue')
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
});
