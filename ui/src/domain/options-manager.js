import LocalStorage from 'src/helpers/local-storage';
import _ from 'lodash';
import Vue from 'vue';

class OptionsManager {
  static options;

  static getDefaultOptions() {
    return {
      size: 'normal', // normal, larger@deprecated
      ideogramSize: '23px',
      pinyinSize: '15px',
      type: '1', // 1 = pinyin_ideograms_without_knew, 2 = ideograms_only, 4 = pinyin_ideograms
      ideogramColored: '1', // bool
      ideogramType: 's', // s = simplified, t = traditional
      ideogramSpaced: '1',  // bool
      pinyinHide: '2',  // 1 = ideograms, 2 = word
      color0: '#000000',
      color1: '#0000ff',
      color2: '#d16f00',
      color3: '#00a000',
      color4: '#ff0000',
      translationLanguage: 'pt',
    };
  }

  static getLanguages(chinese) {
    const languages = [
      { code: 'pt', language: Vue.t('portuguese') },
      { code: 'en', language: Vue.t('english') },
      { code: 'es', language: Vue.t('spanish') },
      { code: 'ko', language: Vue.t('korean') },
      { code: 'ja', language: Vue.t('japanese') },
      { code: 'it', language: Vue.t('italian') },
      { code: 'fr', language: Vue.t('french') },
      { code: 'de', language: Vue.t('german') },
    ];

    if (chinese) {
      languages.push({ code: 'cmn-hans', language: Vue.t('chinese.simplified') });
      languages.push({ code: 'cmn-hant', language: Vue.t('chinese.traditional') });
    }
    return _.orderBy(languages, ['language']);
  }

  static getOptions() {
    if (this.options) {
      return this.options;
    }

    const options = LocalStorage.get('options');
    if (!options) {
      this.options = this.getDefaultOptions();
      return this.options;
    }

    const returnOptions = this.getDefaultOptions();

    for (const prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        returnOptions[prop] = options[prop];
      }
    }

    this.options = returnOptions;
    return this.options;
  }

  static save(newOptions) {
    for (const prop in this.getDefaultOptions()) {
      if (Object.prototype.hasOwnProperty.call(newOptions, prop)) {
        this.options[prop] = newOptions[prop];
      }
    }

    LocalStorage.save('options', this.options);
  }
}

export default OptionsManager;
