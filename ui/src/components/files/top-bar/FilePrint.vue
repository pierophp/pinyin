<template>
  <div>
    <md-button class="md-icon-button" @click.native="editionMode">
      <md-icon>create</md-icon>
    </md-button>
    <md-button class="md-icon-button" @click.native="copy">
      <md-icon>content_copy</md-icon>
    </md-button>
    <md-snackbar md-position="center" :md-duration="1300" :md-active.sync="clipboardOpen">
      <span>{{ $t('copied_to_clipboard') }}</span>
    </md-snackbar>
  </div>
</template>
<script>
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
