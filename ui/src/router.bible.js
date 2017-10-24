import Vue from 'vue';
import VueRouter from 'vue-router';

import User from 'src/domain/user';
import LocalStorage from 'src/helpers/local-storage';
import routes from 'src/routes.bible';

Vue.use(VueRouter);

const router = new VueRouter({ routes });

router.beforeEach((to, from, next) => {
  if (!User.isLogged() && to.matched.length && to.matched[0].meta.protected) {
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

export default router;
