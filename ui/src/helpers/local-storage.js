/* eslint-disable no-undef */
class LocalStorage {
  static get(key) {
    if (!window.frames['iframe-storage'].get) {
      // eslint-disable-next-line
      console.log('Iframe not loaded yet - GET');
      return '';
    }

    return window.frames['iframe-storage'].get(key);
  }

  static save(key, value) {
    window.frames['iframe-storage'].save(key, value);
  }

  static remove(key) {
    window.frames['iframe-storage'].remove(key);
  }

  static has(key) {
    if (!window.frames['iframe-storage'].has) {
      // eslint-disable-next-line
      console.log('Iframe not loaded yet - HAS');
      return false;
    }
    return window.frames['iframe-storage'].has(key);
  }
}

export default LocalStorage;
