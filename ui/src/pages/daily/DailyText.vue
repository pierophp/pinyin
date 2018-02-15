<template>
  <file-container ref="fileContainer" 
    :lines="lines" 
    :fullLines="fullLines" 
    filename="" 
    :fileLoading="fileLoading" 
    :parent="true" 
    :showHighlight="false"
    />
</template>

<script>
import clipboard03 from 'src/domain/clipboard-03';
import separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';
import OptionsManager from 'src/domain/options-manager';

export default {
  name: 'daily-text',

  data() {
    return {
      fileLoading: true,
      lines: [],
      fullLines: [],
    };
  },

  async created() {
    const options = OptionsManager.getOptions();
    const dt = new Date();
    const fullDate = `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`;

    let url = `https://wol.jw.org/wol/dt/r23/lp-chs/${fullDate}`;

    if (options.ideogramType === 't') {
      url = `https://wol.jw.org/wol/dt/r24/lp-ch/${fullDate}`;
    }

    const lines = await clipboard03(url);

    for (const line of lines) {
      for (const block of line) {
        const pinyinList = separatePinyinInSyllables(block.p);
        block.p = pinyinList.join(String.fromCharCode(160));
      }
    }

    this.fullLines = lines;
    this.lines = lines;

    this.fileLoading = false;
  },
  mounted() {},
};
</script>
