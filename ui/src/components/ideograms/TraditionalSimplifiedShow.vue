<template>
    <div class="ideogram-show">
      <ideograms-show :pinyin="pinyin" :character="first" ref="first-ideogram-show"/>
      [<ideograms-show :pinyin="pinyin" :character="secondOnlyDiff" ref="second-ideogram-show"/>]
    </div>
</template>

<script>
import IdeogramsShow from 'src/components/ideograms/Show';
import OptionsManager from 'src/domain/options-manager';

const options = OptionsManager.getOptions();

export default {
  name: 'traditional-simplified-show',
  components: {
    IdeogramsShow,
  },
  props: {
    pinyin: '',
    simplified: '',
    traditional: '',
  },
  watch: {
    first() {
      if (this.$refs['first-ideogram-show']) {
        this.$nextTick(() => {
          this.$refs['first-ideogram-show'].updateRender();
        });
      }
    },
    secondOnlyDiff() {
      if (this.$refs['second-ideogram-show']) {
        this.$nextTick(() => {
          this.$refs['second-ideogram-show'].updateRender();
        });
      }
    },
  },
  computed: {
    first: function first() {
      if (options.ideogramType === 't') {
        return this.traditional;
      }
      return this.simplified;
    },

    second: function second() {
      if (options.ideogramType === 't') {
        return this.simplified;
      }
      return this.traditional;
    },

    secondOnlyDiff() {
      if (!this.second) {
        return '';
      }

      const total = this.second.length;
      let secondWithDiff = '';
      for (let i = 0; i < total; i += 1) {
        const firstChar = this.first[i];
        const secondChar = this.second[i];

        if (firstChar === secondChar) {
          secondWithDiff += '-';
        } else {
          secondWithDiff += secondChar;
        }
      }

      return secondWithDiff;
    },
  },
};
</script>
