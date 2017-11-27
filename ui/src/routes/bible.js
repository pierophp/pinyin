import Login from 'src/pages/auth/Login';
import BibleBooks from 'src/pages/bible/Books';
import BibleChapters from 'src/pages/bible/Chapters';
import BibleChapter from 'src/pages/bible/Chapter';
import BibleSave from 'src/pages/bible/Save';
import Config from 'src/pages/config/Config';
import MyCjkList from 'src/pages/my-cjk/MyCjkList';
import NotFound from 'src/pages/NotFound';
import About from 'src/pages/about/About';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      hideTopBar: true,
      redirectTo: '/#/bible',
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
    path: '/bible',
    name: 'bible',
    component: BibleBooks,
    meta: {
      protected: true,
      topBar: 'bible-books',
    },
  },

  {
    path: '/bible/save',
    name: 'bible-save',
    component: BibleSave,
    meta: {
      protected: true,
      hideTitle: true,
      topBar: 'bible-save',
      topBarLeft: true,
    },
  },
  {
    path: '/bible/:book',
    name: 'bible-chaoters',
    component: BibleChapters,
    meta: {
      protected: true,
      hideTitle: true,
      topBar: 'bible-chapters',
      topBarLeft: true,
    },
  },
  {
    path: '/bible/:book/:chapter',
    name: 'bible-chaoter',
    component: BibleChapter,
    meta: {
      protected: true,
      hideTitle: true,
      topBar: 'bible-chapter',
      topBarLeft: true,
    },
  },
  {
    path: '/my-cjk',
    name: 'my-cjk',
    component: MyCjkList,
    meta: {
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
    meta: {

    },
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
];
