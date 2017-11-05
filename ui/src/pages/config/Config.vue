<template>
  <div class="config-container">
    <h3>{{ $t('settings') }}</h3>
    <md-tabs>
      <md-tab id="visualization" :md-label="$t('visualization_mode')">
        <md-input-container>
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
        </md-input-container>

        <md-input-container>
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
        </md-input-container>


        <md-input-container>
          <label for="ideogramType">{{ $t('ideogram_type') }}</label>
          <md-select name="ideogramType" id="ideogramType" v-model="ideogramType">
            <md-option value="s">{{ $t('simplified') }}</md-option>
            <md-option value="t">{{ $t('traditional') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="type">{{ $t('type') }}</label>
          <md-select name="type" id="type" v-model="type">
            <md-option value="1">{{ $t('pinyin_ideograms_without_knew') }}</md-option>
            <md-option value="2">{{ $t('ideograms_only') }}</md-option>
            <md-option value="3">{{ $t('pinyin_ideograms') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="pinyinHide">{{ $t('hide_pinyin_by') }}</label>
          <md-select name="pinyinHide" id="pinyinHide" v-model="pinyinHide">
            <md-option value="1">{{ $t('ideogram') }}</md-option>
            <md-option value="2">{{ $t('word') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="ideogramSpaced">{{ $t('ideograms_spaced') }}</label>
          <md-select name="ideogramSpaced" id="ideogramSpaced" v-model="ideogramSpaced">
            <md-option value="1">{{ $t('yes') }}</md-option>
            <md-option value="0">{{ $t('no') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="translationLanguage">{{ $t('translation_language') }}</label>
          <md-select name="translationLanguage" id="translationLanguage" v-model="translationLanguage">
            <md-option value="">{{ $t('no_translation') }}</md-option>
            <md-option v-for="(language, languageId) in languages" v-bind:key="languageId"  :value="language.code">{{ language.language }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="ideogramColored">{{ $t('ideograms_colored') }}</label>
          <md-select name="ideogramColored" id="ideogramColored" v-model="ideogramColored">
            <md-option value="1">{{ $t('yes') }}</md-option>
            <md-option value="0">{{ $t('no') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container v-show="ideogramColored == 1">
          <label for="color1">{{ $t('tone_1_color') }}</label>
          <md-input name="color1" type="color" v-model="color1"/>
        </md-input-container>

        <md-input-container v-show="ideogramColored == 1">
          <label for="color2">{{ $t('tone_2_color') }}</label>
          <md-input name="color2" type="color" v-model="color2"/>
        </md-input-container>

        <md-input-container v-show="ideogramColored == 1">
          <label for="color3">{{ $t('tone_3_color') }}</label>
          <md-input name="color3" type="color" v-model="color3" />
        </md-input-container>

        <md-input-container v-show="ideogramColored == 1">
          <label for="color4">{{ $t('tone_4_color') }}</label>
          <md-input name="color4" type="color" v-model="color4" />
        </md-input-container>

        <md-input-container v-show="ideogramColored == 1">
          <label for="color0">{{ $t('tone_0_color') }}</label>
          <md-input name="color0" type="color" v-model="color0"/>
        </md-input-container>
      </md-tab>
    </md-tabs>

    <md-button class="md-raised md-primary" @click.native="save()">{{ $t('save') }}</md-button>
    <md-button class="md-raised md-primary" @click.native="restoreDefault()">{{ $t('restore_default') }}</md-button>
  </div>
</template>

<script>
import LocalStorage from 'src/helpers/local-storage';
import OptionsManager from 'src/domain/options-manager';
import _ from 'lodash';

export default{
  data() {
    const dataDefault = OptionsManager.getDefaultOptions();

    const data = {};
    for (const prop in dataDefault) {
      if (Object.prototype.hasOwnProperty.call(dataDefault, prop)) {
        data[prop] = dataDefault[prop];
      }
    }

    data.dataDefault = dataDefault;
    data.languages = _.orderBy([
      { code: 'pt', language: this.$t('portuguese') },
      { code: 'en', language: this.$t('english') },
      { code: 'es', language: this.$t('spanish') },
      { code: 'ko', language: this.$t('korean') },
      { code: 'ja', language: this.$t('japanese') },
      { code: 'it', language: this.$t('italian') },
      { code: 'fr', language: this.$t('french') },
      { code: 'de', language: this.$t('german') },
    ], ['language']);

    console.log(data);

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
.config-container{
  flex: 1;
  padding: 0 10px;
  overflow: auto;
}
</style>
