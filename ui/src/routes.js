import Login from 'src/pages/auth/Login';
import FilesList from 'src/pages/files/FilesList';
import FileDetails from 'src/pages/files/FileDetails';
import FilePrint from 'src/pages/files/FilePrint';
import MyCjkList from 'src/pages/my-cjk/MyCjkList';
import DictionarySearch from 'src/pages/dictionary/Search';
import DictionaryDetails from 'src/pages/dictionary/Details';
import Config from 'src/pages/config/Config';
import DictionaryTopBar from 'src/components/dictionary/top-bar/dictionary';
import FileDetailsTopBar from 'src/components/files/top-bar/file-details';
import FilePrintTopBar from 'src/components/files/top-bar/file-print';
import VideoShow from 'src/pages/video/Show';
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
  },
  {
    path: '/files/file/:filename',
    name: 'file',
    component: FileDetails,
    meta: {
      topBar: FileDetailsTopBar,
    },
  },
  {
    path: '/files/print/:filename',
    name: 'print',
    component: FilePrint,
    meta: {
      topBar: FilePrintTopBar,
    },
  },
  {
    path: '/my-cjk',
    name: 'my-cjk',
    component: MyCjkList,
  },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: DictionarySearch,
    meta: {
      topBar: DictionaryTopBar,
    },
  },
  {
    path: '/dictionary-details/:id',
    name: 'dictionary-details',
    component: DictionaryDetails,
    meta: {
      topBar: DictionaryTopBar,
    },
  },
  {
    path: '/config',
    name: 'config',
    component: Config,
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
  },
  {
    path: '/bible/:book',
    name: 'bible-chaoters',
    component: BibleChapters,
  },
  {
    path: '/bible/:book/:chapter',
    name: 'bible-chaoter',
    component: BibleChapter,
  },

];
