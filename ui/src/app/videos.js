export default {
  showMenu: true,
  title: 'app.videos',
  menu: [
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
