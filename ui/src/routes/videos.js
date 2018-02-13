import Login from 'src/pages/auth/Login';
import VideoShow from 'src/pages/video/Show';
import NotFound from 'src/pages/NotFound';
import Config from 'src/pages/config/Config';
import About from 'src/pages/about/About';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      hideTopBar: true,
      redirectTo: '/#/video',
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
    path: '/video',
    name: 'video',
    component: VideoShow,
    meta: {
      topBar: 'videos',
      protected: true,
    },
  },
  {
    path: '/config',
    name: 'config',
    component: Config,
    meta: {
      protected: true,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: {},
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
];
