/* eslint-disable no-undef */
class LocalStorage {
  static get(key) {
    if (!window.frames['iframe-storage'].get) {
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
      return false;
    }
    return window.frames['iframe-storage'].has(key);
  }
}

export default LocalStorage;
