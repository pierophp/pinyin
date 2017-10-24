import Login from 'src/pages/auth/Login';
import BibleBooks from 'src/pages/bible/Books';
import BibleChapters from 'src/pages/bible/Chapters';
import BibleChapter from 'src/pages/bible/Chapter';

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
      hideTitle: true,
      topBar: 'bible-books',
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
    },
  },

];
