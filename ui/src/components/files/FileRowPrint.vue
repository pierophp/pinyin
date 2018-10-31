<template>
  <div class="line" :class=[type] v-if="!loading">
    <span v-if="startTime">
      <md-button class="md-icon-button md-primary" @click="goToVideoTime">
        <md-icon>play_circle_filled</md-icon>
      </md-button>
    </span>

    <file-row-translation :line="line" />

    <template v-for="(block, blockIndex) in blocks">
      <!-- @click is on FilePrint because performance  -->
      <div :key="blockIndex" class="block" :data-line="lineIndex" :data-block="blockIndex" :class="[block.classHighlight, block.classExtra]" ref="block">
        <div class="image" v-if="block.small">
          <a href="javascript:void(0)" @click="openImage(block.large)">
            <img :src="block.small" referrerpolicy="no-referrer"/>
          </a>
        </div>

        <template v-if="!block.small">
          <template v-for="(data, dataIndex) in block.printData">
            <template v-if="block.pinyinStyleObject">
              <span class="pinyin" :class="[data.pinyinClass]" v-bind:style="block.pinyinStyleObject" v-html="data.pinyin" v-bind:key="dataIndex"></span>
            </template>
            <template v-if="!block.pinyinStyleObject">{{ data.pinyin }}</template>
          </template>
        </template>
        <div class="character"
          :data-highlight="block.h"
          :data-line="lineIndex"
          :data-block="blockIndex"
          :class="[block.classBold, block.classItalic]"
          v-if="!block.small && !block.footnote && !block.noIdeogram"
          :style="{
            color: block.printDataCharacters.length && block.printDataCharacters[0].sameTone ?
            block.printDataCharacters[0].toneColor : ''
          }">
          <template v-for="(data, index) in block.printDataCharacters">
            <template v-if="!data.toneColor || data.sameTone">{{ data.character }}</template>
            <span v-if="data.toneColor && !data.sameTone"
                :class="[data.ideogramClass]"
                :style="{ color: data.toneColor }"
                v-bind:key="index">{{ data.character }}</span>
          </template>

        </div>

        <div class="character footnote" v-if="block.footnote" @click.prevent="openFootnote(block.footnote)">
            {{ block.c }}
        </div>
      </div>
    </template>
    <div class="clearfix"></div>
  </div>
</template>

<script>
import FileRowTranslation from 'src/components/files/FileRowTranslation';
import separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';
import ideogramsShow from 'src/helpers/ideograms.show';
import OptionsManager from 'src/domain/options-manager';
import { mapActions } from 'vuex';

import { FILE_ACTION_CAN_HIDE_PINYIN } from 'src/data/file/types';

export default {
  name: 'file-row',
  components: {
    FileRowTranslation,
  },
  data() {
    return {
      type: '',
      startTime: '',
      loading: true,
    };
  },
  props: {
    line: {
      type: Array,
      default: () => [],
    },
    lineIndex: {
      default: 0,
    },
  },
  async created() {
    this.type = '';
    if (this.line[0] !== undefined && this.line[0].line !== undefined) {
      const type = this.line[0].line.type;
      this.type = `type-${type}`;
    }

    if (this.line[0] !== undefined && this.line[0].startTime !== undefined) {
      this.startTime = this.line[0].startTime;
    }
  },

  async mounted() {
    await this.updateRender();
  },
  methods: {
    ...mapActions({
      canHidePinyin: FILE_ACTION_CAN_HIDE_PINYIN,
    }),
    goToVideoTime() {
      this.$emit('go-to-video-time', this.startTime);
    },
    openImage(image) {
      this.$emit('open-image', image);
    },
    openFootnote(footnote) {
      this.$emit('open-footnote', footnote);
    },
    async updateBlockRender(blockIndex) {
      const newBlock = await this.generateBlock(this.line[blockIndex]);
      this.blocks[blockIndex] = newBlock;
      this.$forceUpdate();
    },

    async updateRender() {
      this.loading = true;
      let blockIndex = 0;
      this.blocks = [];
      for (const block of this.line) {
        this.blocks[blockIndex] = await this.generateBlock(block);

        blockIndex++;
      }
      this.loading = false;
    },
    async generateBlock(block) {
      const generatedBlock = {};
      generatedBlock.small = block.small;
      generatedBlock.large = block.large;
      generatedBlock.footnote = block.footnote;
      generatedBlock.noIdeogram = block.noIdeogram;

      const options = OptionsManager.getOptions();
      generatedBlock.classHighlight = `highlight-${block.h ? block.h : ''}`;
      generatedBlock.classBold = '';
      if (block.isBold === 1) {
        generatedBlock.classBold = 'bold';
      }

      generatedBlock.classItalic = '';
      if (block.isItalic === 1) {
        generatedBlock.classItalic = 'italic';
      }

      generatedBlock.classExtra = '';
      if (block.v) {
        generatedBlock.classExtra = 'verse';
        if (block.v === 1) {
          generatedBlock.classExtra = 'chapter';
        }
      }

      const printData = [];
      const chars = block.c.toString();

      let withoutPinyn = true;
      const pinyin = separatePinyinInSyllables(block.p, true);

      for (let i = 0; i < chars.length; i += 1) {
        let newPinyin = '';
        let pinyinClass = '';
        let hidePinyin = false;

        // 1 = pinyin_ideograms_without_knew,
        if (options.pinyinHide === '1') {
          // eslint-disable-next-line
          hidePinyin =
            (await this.canHidePinyin(chars[i])) ||
            pinyin[i] === undefined ||
            pinyin[i] === '';
          // 2 = ideograms_only,
        } else if (options.pinyinHide === '2') {
          // eslint-disable-next-line
          hidePinyin =
            (await this.canHidePinyin(chars)) ||
            pinyin[i] === undefined ||
            pinyin[i] === '';
        }

        // 4 = pinyin_ideograms
        if (options.type === '4' && !hidePinyin && chars[i].trim()) {
          pinyinClass = 'hide-pinyin';
          newPinyin = '&nbsp;';
        } else if (
          (options.type === '1' || options.type === '2') &&
          hidePinyin
        ) {
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

      generatedBlock.pinyinStyleObject = null;

      if (withoutPinyn) {
        printData.forEach((item, i) => {
          printData[i].pinyinClass = '';
          printData[i].pinyin = '';
        });

        generatedBlock.pinyinStyleObject = {};
        generatedBlock.pinyinStyleObject.height = 'auto';
      }

      if (chars.length === 0) {
        printData.push({
          pinyinClass: '',
          character: '',
          pinyin: `${block.p}&nbsp;`,
        });
      }

      generatedBlock.printData = printData;
      generatedBlock.printDataCharacters = ideogramsShow({
        character: block.c,
        pinyin: block.p,
        useSpaces: true,
      });

      return generatedBlock;
    },
  },
};
</script>
