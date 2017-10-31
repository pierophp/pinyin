import Login from 'src/pages/auth/Login';
import FilesList from 'src/pages/files/FilesList';
import FileDetails from 'src/pages/files/FileDetails';
import FilePrint from 'src/pages/files/FilePrint';
import MyCjkList from 'src/pages/my-cjk/MyCjkList';
import DictionarySearch from 'src/pages/dictionary/Search';
import DictionaryDetails from 'src/pages/dictionary/Details';
import Config from 'src/pages/config/Config';
import VideoShow from 'src/pages/video/Show';
import BibleBooks from 'src/pages/bible/Books';
import BibleChapters from 'src/pages/bible/Chapters';
import BibleChapter from 'src/pages/bible/Chapter';
import NotFound from 'src/pages/NotFound';

export default [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      hideTopBar: true,
      redirectTo: '/#/files',
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
    path: '/files',
    name: 'files',
    component: FilesList,
    meta: {
      protected: true,
    },
  },
  {
    path: '/files/file/:filename',
    name: 'file',
    component: FileDetails,
    meta: {
      protected: true,
      topBar: 'file-details',
    },
  },
  {
    path: '/files/print/:filename',
    name: 'print',
    component: FilePrint,
    meta: {
      protected: true,
      topBar: 'file-print',
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
    path: '/config',
    name: 'config',
    component: Config,
    meta: {
      protected: true,
    },
  },
  {
    path: '/video',
    name: 'video',
    component: VideoShow,
  },
  {
    path: '/bible',
    name: 'bible',
    component: BibleBooks,
    meta: {
      topBar: 'bible-books',
      protected: true,
    },
  },
  {
    path: '/bible/:book',
    name: 'bible-chaoters',
    component: BibleChapters,
    meta: {
      hideTitle: true,
      topBar: 'bible-chapters',
      protected: true,
    },
  },
  {
    path: '/bible/:book/:chapter',
    name: 'bible-chaoter',
    component: BibleChapter,
    meta: {
      hideTitle: true,
      topBar: 'bible-chapter',
      protected: true,
    },
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
];
