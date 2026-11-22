import { createApp } from 'vue';
import '@emmanuelplougoulm/folio/fonts.css';
import '@emmanuelplougoulm/folio/style.css';
import '@emmanuelplougoulm/folio/base.css';
import './styles/app.css';
import App from './App.vue';
import { i18n } from './i18n';
import { router, showServerError } from './router';

const app = createApp(App).use(i18n).use(router);
app.config.errorHandler = showServerError;
app.mount('#app');
