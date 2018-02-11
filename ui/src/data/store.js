import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default async () => {
  const store = new Vuex.Store({
    modules: {
      FILE: (await import('./file')).default,
      BIBLE: (await import('./bible')).default,
      VIDEO: (await import('./video')).default,
    },
  });

  return store;
};
