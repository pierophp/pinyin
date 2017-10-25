import Vue from 'vue';
import VueRouter from 'vue-router';

import User from 'src/domain/user';
import LocalStorage from 'src/helpers/local-storage';

module.exports = (routes, appOptions) => {
  Vue.use(VueRouter);

  const router = new VueRouter({ routes, appOptions });

  router.beforeEach((to, from, next) => {
    if (!User.isLogged() && to && to.matched.length && to.matched[0].meta.protected) {
      next('/');
    } else {
      if (LocalStorage.has('url') && User.isLogged()) {
        const url = LocalStorage.get('url');

        LocalStorage.remove('url');
        next(url);
      }

      next();
    }
  });

  return router;
};
