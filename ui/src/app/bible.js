
export default {
  showMenu: true,
  title: 'app.bible',
  menu: [
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
      icon: 'settings',
      title: 'menu.settings',
      action: 'goTo',
      link: '/config',
    },
    {
      icon: 'about',
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
