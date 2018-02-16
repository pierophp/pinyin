<template>
  <div class="config-container">
    <h3>{{ $t('settings') }}</h3>
    <div class="size-container">
      <md-field>
        <label for="pinyinSize">{{ $t('Pinyin') }} - {{ $t('size') }}</label>
        <md-select name="pinyinSize" id="pinyinSize" v-model="pinyinSize">
          <md-option value="12px">12</md-option>
          <md-option value="13px">13</md-option>
          <md-option value="14px">14</md-option>
          <md-option value="15px">15</md-option>
          <md-option value="16px">16</md-option>
          <md-option value="17px">17</md-option>
          <md-option value="18px">18</md-option>
          <md-option value="19px">19</md-option>
          <md-option value="20px">20</md-option>
          <md-option value="21px">21</md-option>
          <md-option value="22px">22</md-option>
          <md-option value="23px">23</md-option>
          <md-option value="24px">24</md-option>
          <md-option value="25px">25</md-option>
          <md-option value="26px">26</md-option>
          <md-option value="27px">27</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="ideogramSize">{{ $t('ideogram') }} - {{ $t('size') }}</label>
        <md-select name="ideogramSize" id="ideogramSize" v-model="ideogramSize">
          <md-option value="17px">17</md-option>
          <md-option value="18px">18</md-option>
          <md-option value="19px">19</md-option>
          <md-option value="20px">20</md-option>
          <md-option value="21px">21</md-option>
          <md-option value="22px">22</md-option>
          <md-option value="23px">23</md-option>
          <md-option value="24px">24</md-option>
          <md-option value="25px">25</md-option>
          <md-option value="26px">26</md-option>
          <md-option value="27px">27</md-option>
          <md-option value="27px">28</md-option>
          <md-option value="29px">29</md-option>
          <md-option value="30px">30</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="blockMarginBottom">{{ $t('margin_bottom') }}</label>
        <md-select name="blockMarginBottom" id="blockMarginBottom" v-model="blockMarginBottom">
          <md-option value="0px">0</md-option>
          <md-option value="1px">1</md-option>
          <md-option value="2px">2</md-option>
          <md-option value="3px">3</md-option>
          <md-option value="4px">4</md-option>
          <md-option value="5px">5</md-option>
          <md-option value="6px">6</md-option>
          <md-option value="7px">7</md-option>
          <md-option value="8px">8</md-option>
          <md-option value="9px">9</md-option>
          <md-option value="10px">10</md-option>
          <md-option value="11px">11</md-option>
          <md-option value="12px">12</md-option>
          <md-option value="13px">13</md-option>
          <md-option value="14px">14</md-option>
          <md-option value="15px">15</md-option>
        </md-select>
      </md-field>
    </div>

    <div class="language-container">
      <md-field>
        <label for="translationLanguage">{{ $t('translation_language') }}</label>
        <md-select name="translationLanguage" id="translationLanguage" v-model="translationLanguage">
          <md-option value="">{{ $t('no_translation') }}</md-option>
          <md-option v-for="(language, languageId) in languages" v-bind:key="languageId"  :value="language.code">{{ language.language }}</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="ideogramType">{{ $t('ideogram_type') }}</label>
        <md-select name="ideogramType" id="ideogramType" v-model="ideogramType">
          <md-option value="s">{{ $t('simplified') }}</md-option>
          <md-option value="t">{{ $t('traditional') }}</md-option>
        </md-select>
      </md-field>
    </div>

    <div class="pinyin-container">
      <md-field>
        <label for="type">{{ $t('show_pinyin') }}</label>
        <md-select name="type" id="type" v-model="type">
          <md-option value="1">{{ $t('without_knew') }}</md-option>
          <md-option value="4" v-if="hidePinyinSource === 'editor'">{{ $t('with_unknew') }}</md-option>
          <md-option value="2">{{ $t('without_any') }}</md-option>
          <md-option value="3">{{ $t('all') }}</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="pinyinHide">{{ $t('hide_pinyin_by') }}</label>
        <md-select name="pinyinHide" id="pinyinHide" v-model="pinyinHide">
          <md-option value="1">{{ $t('ideogram') }}</md-option>
          <md-option value="2">{{ $t('word') }}</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="hidePinyinSource">{{ $t('hide_pinyin_from') }}</label>
        <md-select name="hidePinyinSource" id="hidePinyinSource" v-model="hidePinyinSource">
          <md-option value="editor">editor.2pinyin.net</md-option>
          <md-option value="2pinyin">2pinyin.net</md-option>
        </md-select>
      </md-field>
    </div>

    <div class="ideogram-container">
      <md-field>
        <label for="ideogramColored">{{ $t('ideograms_colored') }}</label>
        <md-select name="ideogramColored" id="ideogramColored" v-model="ideogramColored">
          <md-option value="1">{{ $t('yes') }}</md-option>
          <md-option value="0">{{ $t('no') }}</md-option>
        </md-select>
      </md-field>

      <md-field>
        <label for="ideogramSpaced">{{ $t('ideograms_spaced') }}</label>
        <md-select name="ideogramSpaced" id="ideogramSpaced" v-model="ideogramSpaced">
          <md-option value="1">{{ $t('yes') }}</md-option>
          <md-option value="0">{{ $t('no') }}</md-option>
        </md-select>
      </md-field>
    </div>

    <div class="color-container">
      <md-field v-show="ideogramColored == 1">
        <label for="color1">{{ $t('tone_1_color') }}</label>
        <md-input name="color1" type="color" v-model="color1"/>
      </md-field>

      <md-field v-show="ideogramColored == 1">
        <label for="color2">{{ $t('tone_2_color') }}</label>
        <md-input name="color2" type="color" v-model="color2"/>
      </md-field>

      <md-field v-show="ideogramColored == 1">
        <label for="color3">{{ $t('tone_3_color') }}</label>
        <md-input name="color3" type="color" v-model="color3" />
      </md-field>

      <md-field v-show="ideogramColored == 1">
        <label for="color4">{{ $t('tone_4_color') }}</label>
        <md-input name="color4" type="color" v-model="color4" />
      </md-field>

      <md-field v-show="ideogramColored == 1">
        <label for="color0">{{ $t('tone_0_color') }}</label>
        <md-input name="color0" type="color" v-model="color0"/>
      </md-field>
    </div>

    <md-button class="md-raised md-primary" @click.native="save()">{{ $t('save') }}</md-button>
    <md-button class="md-raised md-primary" @click.native="restoreDefault()">{{ $t('restore_default') }}</md-button>

    <md-snackbar md-position="center" :md-duration="1300" :md-active.sync="saveNotify">
      <span>{{ $t('saved_successfully') }}</span>
    </md-snackbar>
  </div>
</template>

<script>
import LocalStorage from 'src/helpers/local-storage';
import OptionsManager from 'src/domain/options-manager';

export default {
  data() {
    const dataDefault = OptionsManager.getDefaultOptions();

    const data = {};
    for (const prop in dataDefault) {
      if (Object.prototype.hasOwnProperty.call(dataDefault, prop)) {
        data[prop] = dataDefault[prop];
      }
    }

    data.dataDefault = dataDefault;
    data.languages = OptionsManager.getLanguages(false);
    data.saveNotify = false;

    return data;
  },
  created() {
    const options = LocalStorage.get('options');
    if (!options) {
      return;
    }

    for (const prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        this[prop] = options[prop];
      }
    }
  },
  methods: {
    save() {
      OptionsManager.save(this);
      this.saveNotify = true;
    },
    restoreDefault() {
      for (const prop in this.dataDefault) {
        if (Object.prototype.hasOwnProperty.call(this.dataDefault, prop)) {
          this[prop] = this.dataDefault[prop];
        }
      }
    },
  },
};
</script>

<style>
.config-container {
  flex: 1;
  padding: 0 10px 20px;
  overflow: auto;
}

.config-container .size-container {
  display: flex;
  flex-wrap: wrap;
}

.config-container .size-container .md-field {
  margin-right: 15px;
  width: 150px;
}

.config-container .language-container {
  display: flex;
  flex-wrap: wrap;
}

.config-container .language-container .md-field {
  margin-right: 15px;
  flex: 1;
  max-width: 200px;
}

.config-container .pinyin-container {
  display: flex;
  flex-wrap: wrap;
}

.config-container .pinyin-container .md-field {
  margin-right: 15px;
  width: 140px;
}

.config-container .ideogram-container .md-field {
  margin-right: 15px;
  flex: 1;
  max-width: 200px;
}

.config-container .ideogram-container {
  display: flex;
  flex-wrap: wrap;
}

.config-container .color-container {
  display: flex;
  flex-wrap: wrap;
}

.config-container .color-container .md-field {
  width: 95px;
  margin-bottom: 10px;
  margin-right: 15px;
}
</style>
