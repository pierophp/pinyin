import loadMain from './main';

function tryLoadMain() {
  console.log('tryLoadMain');
  try {
    if (window.frames['iframe-storage'].get) {
      loadMain('editor');
    } else {
      setTimeout(tryLoadMain, 50);
    }
  } catch (e) {
    console.log(e);
    setTimeout(tryLoadMain, 50);
  }
}

tryLoadMain();
