/* eslint-disable */

import offlinePlugin from 'offline-plugin/runtime';
import Vue from 'vue';
import VueMaterial from 'vue-material';
import VueI18n from 'vue-i18n';
import VueAnalytics from 'vue-analytics';
import VueClipboards from 'vue-clipboards';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-social/bootstrap-social.css';
import 'font-awesome/css/font-awesome.min.css';
import 'vue-material/dist/vue-material.css';
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

function loadMain() {
  const routerMethod = require('src/router');
  const routes = require('src/routes.videos');

  const router = routerMethod(routes, {
    showMenu: false,
    title: 'app.videos',
  });

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
      onUpdateReady: () => {
        // Tells to new SW to take control immediately
        offlinePlugin.applyUpdate();
      },
      onUpdated: () => {
        // Reload the webpage to load into the new version
        window.location.reload();
      },
    });

    Vue.use(VueAnalytics, {
      id: 'UA-4081205-4',
      router,
    });
  }

  const Main = Vue.extend(App);

  new Main({
    router,
    store: store(),
  }).$mount('#app');
}

function tryLoadMain() {
  try {
    if (window.frames['iframe-storage'].get) {
      loadMain();
    } else {
      setTimeout(tryLoadMain, 50);
    }
  } catch (e) {
    setTimeout(tryLoadMain, 50);
  }
}

tryLoadMain();
