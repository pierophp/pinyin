<template>
  <div>
    <div class="dict-list" v-for="(dictionary, dictionaryId) in list" v-bind:key="dictionaryId">
      <a href="javascript:void(0)" @click="changeShowDictionary(dictionaryId)">
        <traditional-simplified-show :pinyin="dictionary.pronunciation" :ideograms="dictionary.ideograms" :variants="[]"/>
      </a>

      <a href="javascript:void(0)" @click="changeShowDictionary(dictionaryId)">{{ dictionary.pronunciation }}</a>
      
      <div v-show="showDictionary === dictionaryId">
        <dictionary-details v-if="dictionary" :dictionary="dictionary" :pinyin="dictionary.pinyin" @change-show="changeShow"/>
      </div>
    </div>
  </div>
</template>

<script>
import TraditionalSimplifiedShow from 'src/components/ideograms/TraditionalSimplifiedShow';
import DictionaryDetails from 'src/components/dictionary/Details';

export default {
  name: 'dictionary-list',
  components: {
    DictionaryDetails,
    TraditionalSimplifiedShow,
  },
  data() {
    return {
      showDictionary: '',
    };
  },
  props: {
    list: [],
  },
  methods: {
    changeShow(editing) {
      this.$emit('change-show', editing);
    },
    changeShowDictionary(dictionaryId) {
      if (this.showDictionary === dictionaryId) {
        this.showDictionary = '';
        return;
      }
      this.showDictionary = dictionaryId;
    },
  },
};
</script>

<style>
.dict-list .ideogram-show {
  font-size: 20px;
}

.dict-list {
  border-bottom: 2px solid #ccc;
  margin-bottom: 15px;
}
</style>
