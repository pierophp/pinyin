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
import clipboardUrl from 'src/domain/clipboard-url';
import * as separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';

import { mapGetters } from 'vuex';

import { BROWSER_GETTER_URL } from 'src/data/browser/types';

export default {
  name: 'browser',

  data() {
    return {
      fileLoading: false,
      lines: [],
      fullLines: [],
    };
  },

  watch: {
    url() {
      this.loadUrl(this.url);
    },
  },
  computed: {
    ...mapGetters({
      url: BROWSER_GETTER_URL,
    }),
  },

  methods: {
    async loadUrl(url) {
      this.fullLines = [];
      this.lines = [];

      if (!url) {
        this.fileLoading = false;
        return;
      }

      this.fileLoading = true;
      const lines = await clipboardUrl(url);
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
  },
  mounted() {
    if (this.url) {
      this.loadUrl(this.url);
    }
  },
};
</script>
