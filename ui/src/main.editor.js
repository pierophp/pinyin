import loadMain from 'main';

function tryLoadMain() {
  try {
    if (window.frames['iframe-storage'].get) {
      loadMain('editor');
    } else {
      setTimeout(tryLoadMain, 50);
    }
  } catch (e) {
    setTimeout(tryLoadMain, 50);
  }
}

tryLoadMain();