import Login from 'src/pages/auth/Login';
import VideoShow from 'src/pages/video/Show';

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
  },
];
