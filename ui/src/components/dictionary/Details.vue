<template>
  <div>
  <div v-if="dictionary.pt">
    <div class="dict-title">PT</div>
    <div class="dict-block">
      <div v-if="!editing" >
        <div v-for="(pt, dictId) in dictionary.pt" v-bind:key="dictId">{{ pt }}</div>
        <md-button v-if="user.admin" class="md-raised md-primary" @click.native="edit()">
          {{$t('edit')}}
        </md-button>
      </div>
      <div v-if="editing">
        <md-field>
          <md-textarea v-model="dictionaryEntry"/>
        </md-field>
        <md-button class="md-raised md-primary" @click.native="save()">{{$t('save')}}</md-button>
        <md-button class="md-raised md-accent" @click.native="cancelEdit()">{{$t('cancel')}}</md-button>
      </div>
    </div>
  </div>

  <div v-if="dictionary.chinese_tools_pt">
    <div class="dict-title">Chinese Tools - PT</div>
    <div class="dict-block">
      <div v-for="(chinese_tools_pt, dictId) in dictionary.chinese_tools_pt" v-bind:key="dictId">{{ chinese_tools_pt }}</div>
    </div>
  </div>

  <div v-if="dictionary.chinese_tools_es">
    <div class="dict-title">Chinese Tools - ES</div>
    <div class="dict-block">
      <div v-for="(chinese_tools_es, dictId) in dictionary.chinese_tools_es" v-bind:key="dictId">{{ chinese_tools_es }}</div>
    </div>
  </div>

  <div v-if="dictionary.unihan">
    <div class="dict-title">Unihan</div>
    <div class="dict-block">
      <div v-for="(unihan, dictId) in dictionary.unihan" v-bind:key="dictId">{{ unihan }}</div>
    </div>
  </div>

  <div v-if="dictionary.cedict">
    <div class="dict-title">CC-CEDICT</div>
    <div  class="dict-block">
      <div v-for="(cedict, dictId) in dictionary.cedict" v-bind:key="dictId">{{ cedict }}</div>
    </div>
  </div>

  <div v-if="dictionary.chinese_tools_en">
    <div class="dict-title">Chinese Tools - EN</div>
    <div class="dict-block">
      <div v-for="(chinese_tools_en, dictId) in dictionary.chinese_tools_en" v-bind:key="dictId">{{ chinese_tools_en }}</div>
    </div>
  </div>
  </div>
</template>

<script>
import http from 'src/helpers/http';
import User from 'src/domain/user';

export default {
  name: 'dictionary-details',
  watch: {
    dictionary() {
      this.dictionaryEntry = this.getDictionaryEntry();
    },
  },
  data() {
    return {
      editing: false,
      dictionaryEntry: this.getDictionaryEntry(),
      user: User.getUser(),
    };
  },
  methods: {
    getDictionaryEntry() {
      let dictionaryEntry = '';
      if (!this.dictionary.pt) {
        this.dictionary.pt = [];
      }

      this.dictionary.pt.forEach(entry => {
        dictionaryEntry += `${entry}\n`;
      });

      dictionaryEntry = dictionaryEntry.trim('\n');

      return dictionaryEntry;
    },
    cancelEdit() {
      this.editing = false;
      this.$emit('change-show', this.editing);
    },
    edit() {
      this.editing = true;
      this.$emit('change-show', this.editing);
    },
    save() {
      const dictionatyList = this.dictionaryEntry
        .split('\n')
        .filter(item => item);

      http
        .post('unihan/save', {
          pinyin: this.pinyin,
          ideograms: this.dictionary.ideograms,
          dictionary: dictionatyList,
        })
        .then(() => {
          this.dictionary.pt = dictionatyList;
          this.editing = false;
          this.$emit('change-show', this.editing);
        });
    },
  },
  props: {
    pinyin: {},
    ideograms: {},
    dictionary: {},
  },
};
</script>

<style>
.dict-block .md-input-container {
  margin-top: 0 !important;
}

.dict-block textarea {
  height: 250px !important;
}
</style>
