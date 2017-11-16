<template>
  <!-- @click is on FilePrint cause performance  -->
  <div class="block" :data-line="lineIndex" :data-block="blockIndex" :class="[classHighlight, classExtra]" ref="block">
    <div class="image" v-if="block.small">
      <a href="javascript:void(0)" @click="openImage(block.large)">
        <img :src="block.small" referrerpolicy="no-referrer"/>
      </a>
    </div>

    <div class="pinyin" v-if="!block.small && !withoutPinyn">
      <span>
        <span v-for="(data, dataIndex) in printData" :class="[data.pinyinClass]" v-html="data.pinyin" v-bind:key="dataIndex" ></span>
      </span>
    </div>

    <div class="character" :data-highlight="highlight" :data-line="lineIndex" :data-block="blockIndex" :class="classBold" v-if="!block.small && !block.footnote && !block.noIdeogram">
      <ideograms-show :pinyin="pinyin" :character="character" :useSpaces="true"/>
    </div>

    <div class="character footnote" v-if="block.footnote" @click.prevent="openFootnote(block.footnote)">
        {{ character }}
    </div>
  </div>
</template>

<script>
  import separatePinyinInSyllables from 'shared/helpers/separate-pinyin-in-syllables';
  import IdeogramsShow from 'src/components/ideograms/Show';
  import OptionsManager from 'src/domain/options-manager';

  import {
    mapActions,
  } from 'vuex';

  import {
    FILE_ACTION_CAN_HIDE_PINYIN,
  } from 'src/data/file/types';

  export default {
    name: 'file-block-print',
    components: {
      IdeogramsShow,
    },
    data() {
      return {
        classHighlight: '',
        classExtra: '',
        classBold: '',
        printData: [],
        withoutPinyn: false,
      };
    },
    props: {
      pinyin: '',
      character: '',
      lineIndex: {
        type: Number,
        default: 0,
      },
      blockIndex: {
        type: Number,
        default: 0,
      },
      isBold: {
        default: 0,
      },
      highlight: '',
      block: '',
    },
    watch: {
      pinyin() {
        this.updateRender();
      },

      character() {
        this.updateRender();
      },

      highlight() {
        this.updateRender();
      },
    },
    created() {
      this.updateRender();
    },
    methods: {
      ...mapActions({
        canHidePinyin: FILE_ACTION_CAN_HIDE_PINYIN,
      }),
      openFootnote(footnote) {
        this.$emit('open-footnote', {
          footnote,
        });
      },

      openImage(src) {
        this.$emit('open-image', {
          src,
        });
      },

      async updateRender() {
        const options = OptionsManager.getOptions();
        this.classHighlight = `highlight-${this.highlight ? this.highlight : ''}`;
        this.classBold = '';
        if (this.isBold === 1) {
          this.classBold = 'bold';
        }

        this.classExtra = '';
        if (this.block.v) {
          this.classExtra = 'verse';
          if (this.block.v === 1) {
            this.classExtra = 'chapter';
          }
        }

        const printData = [];
        const chars = this.character.toString();

        let withoutPinyn = true;
        const pinyin = separatePinyinInSyllables(this.pinyin, true);

        for (let i = 0; i < chars.length; i += 1) {
          let newPinyin = '';
          let pinyinClass = '';
          let hidePinyin = false;
          if (options.pinyinHide === '1') {
            // eslint-disable-next-line
            hidePinyin = (await this.canHidePinyin(chars[i]) || pinyin[i] === undefined || pinyin[i] === '');
          } else if (options.pinyinHide === '2') {
            // eslint-disable-next-line
            hidePinyin = (await this.canHidePinyin(chars) || pinyin[i] === undefined || pinyin[i] === '');
          }

          if (options.type !== '3' && hidePinyin) {
            pinyinClass = 'hide-pinyin';
            newPinyin = '&nbsp;';
          } else if (pinyin[i]) {
            withoutPinyn = false;
            newPinyin = pinyin[i];
          } else {
            withoutPinyn = false;
            newPinyin = ' ';
          }

          printData.push({
            pinyinClass,
            character: chars[i],
            pinyin: newPinyin,
          });
        }

        if (withoutPinyn) {
          printData.forEach((item, i) => {
            printData[i].pinyinClass = '';
            printData[i].pinyin = '';
          });
        }

       // this.withoutPinyn = withoutPinyn;

        if (chars.length === 0) {
          printData.push({
            pinyinClass: '',
            character: '',
            pinyin: `${this.pinyin}&nbsp;`,
          });
        }

        this.printData = printData;
      },
    },
  };
</script>

<style>
.new-line {
  margin-top: 15px;
}

</style>
