import Login from 'src/pages/auth/Login';
import DictionarySearch from 'src/pages/dictionary/Search';
import DictionaryDetails from 'src/pages/dictionary/Details';
import NotFound from 'src/pages/NotFound';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      hideTopBar: true,
      redirectTo: '/#/dictionary',
    },
  },
  {
    path: '/login/baidu',
    name: 'login-baidu',
    component: Login,
    meta: {
      hideTopBar: true,
    },
  },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: DictionarySearch,
    meta: {
      topBar: 'dictionary',
    },
  },
  {
    path: '/dictionary-details/:id',
    name: 'dictionary-details',
    component: DictionaryDetails,
    meta: {
      topBar: 'dictionary',
    },
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },

];
