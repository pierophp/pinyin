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
      icon: 'today',
      title: 'menu.daily_text',
      action: 'goTo',
      link: '/daily_text',
    },
    {
      icon: 'settings',
      title: 'menu.settings',
      action: 'goTo',
      link: '/config',
    },
    {
      icon: 'help',
      title: 'menu.about',
      action: 'goTo',
      link: '/about',
    },
    {
      icon: 'power_settings_new',
      title: 'menu.logout',
      action: 'logout',
      link: '',
    },
  ],
};
