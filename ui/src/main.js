/* eslint-disable */

import offlinePlugin from 'offline-plugin/runtime';
import Vue from 'vue';

import VueMaterial from 'vue-material';
import VueI18n from 'vue-i18n';
// import { MdButton, MdIcon, MdToolbar } from 'vue-i18n';
import VueAnalytics from 'vue-analytics';
import VueClipboards from 'vue-clipboards';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-social/bootstrap-social.css';
import 'font-awesome/css/font-awesome.min.css';
import 'src/css/vue-material.scss';
import 'src/css/default.css';
import 'src/css/bootstrap-callout.css';
import 'src/helpers/array';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

import App from 'src/pages/App';
import store from 'src/data/store';
import localeEn from 'src/data/locale/en';
import localePt from 'src/data/locale/pt';
import FileContainer from 'src/components/files/FileContainer';

export default async function loadMain(moduleName) {

  const routerMethod = (await import('src/router')).default;

  const routes = (await import(`src/routes/${moduleName}`)).default;

  const router = routerMethod(routes, (await import(`src/app/${moduleName}`)).default);

  Vue.use(VueI18n);
  Vue.use(VueMaterial);
  Vue.use(VueClipboards);

  Vue.component('file-container', FileContainer);

  Vue.locale('en', localeEn);
  Vue.locale('pt', localePt);

  Vue.config.lang = navigator.language.split('-')[0];
  Vue.config.fallbackLang = 'en';

  if (process.env.NODE_ENV === 'production') {
    offlinePlugin.install({
      onUpdateReady() {
        // Tells to new SW to take control immediately
        offlinePlugin.applyUpdate();
      },
      onUpdated() {
        // Reload the webpage to load into the new version
        // window.location.reload();
      },
    });

    Vue.use(VueAnalytics, {
      id: 'UA-4081205-4',
      router,
    });

    Raven
    .config('https://c66b5a8acf4440d796646fdab764969a@sentry.io/245293')
    .addPlugin(RavenVue, Vue)
    .install();
  }

  const Main = Vue.extend(App);

  new Main({
    router,
    store: await store(),
  }).$mount('#app');
};
