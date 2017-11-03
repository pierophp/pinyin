export default {
  showMenu: true,
  title: 'app.editor',
  menu: [
    {
      icon: 'insert_drive_file',
      title: 'menu.my_files',
      action: 'goTo',
      link: '/files',
    },
    {
      icon: 'pageview',
      title: 'menu.dictionary',
      action: 'goTo',
      link: '/dictionary',
    },
    {
      icon: 'import_contacts',
      title: 'menu.bible',
      action: 'goTo',
      link: '/bible',
    },
    {
      icon: 'translate',
      title: 'menu.my_ideograms',
      action: 'goTo',
      link: '/my-cjk',
    },
    {
      icon: 'play_circle_outline',
      title: 'menu.video',
      action: 'goTo',
      link: '/video',
    },
    {
      icon: 'settings',
      title: 'menu.settings',
      action: 'goTo',
      link: '/config',
    },
    {
      icon: 'power_settings_new',
      title: 'menu.logout',
      action: 'logout',
      link: '',
    },
  ],
};
