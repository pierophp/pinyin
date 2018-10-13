<template>
  <div>
    <v-btn icon @click.native="editionMode">
      <v-icon>create</v-icon>
    </v-btn>
    <v-btn icon @click.native="copy">
      <v-icon>content_copy</v-icon>
    </v-btn>

    <v-snackbar
      v-model="clipboardOpen"
      :timeout="1300"
      :absolute="true"
      :bottom="true"
    >
      {{ $t('copied_to_clipboard') }}
    </v-snackbar>
  </div>
</template>
<script>
// @todo FIX Snackbar open on top component

import { FILE_GETTER_FULL_FILE } from 'src/data/file/types';
import { mapGetters } from 'vuex';
import replaceall from 'replaceall';

export default {
  data() {
    return { clipboardOpen: false };
  },
  methods: {
    ...mapGetters({
      getFullLines: FILE_GETTER_FULL_FILE,
    }),
    editionMode() {
      this.$router.push({
        name: 'file',
        params: { filename: this.$route.params.filename },
      });
    },
    copy() {
      const fileCopy = [];
      const lines = this.getFullLines();
      for (const line of lines) {
        let pinyinLine = '';
        let ideogramLine = '';
        for (const block of line) {
          if (block.small) {
            continue;
          }

          pinyinLine += `${replaceall(String.fromCharCode(160), '', block.p)} `;
          ideogramLine += `${block.c} `;
        }

        if (!ideogramLine) {
          continue;
        }

        fileCopy.push(pinyinLine);
        fileCopy.push(ideogramLine);
        fileCopy.push('');
      }

      this.$clipboard(fileCopy.join('\n'));
      this.clipboardOpen = true;
    },
  },
};
</script>
