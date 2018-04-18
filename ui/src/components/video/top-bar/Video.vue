<template>
  <div>
    <md-button class="md-icon-button" @click="loadHistory()">
      <md-icon>schedule</md-icon>
    </md-button>

    <md-button class="md-icon-button" @click.native="copy" v-if="fullFile && fullFile.length">
      <md-icon>content_copy</md-icon>
    </md-button>

    <md-snackbar md-position="center" :md-duration="1300" :md-active.sync="clipboardOpen">
      <span>{{ $t('copied_to_clipboard') }}</span>
    </md-snackbar>

    <md-dialog :md-active.sync="modalOpen" :md-fullscreen="false" :md-backdrop="true" :md-click-outside-to-close="true">
      <md-dialog-title>
        {{ $t('history') }}
      </md-dialog-title>

      <md-dialog-content>
        <div v-for="(item, itemId) in history" v-bind:key="itemId" class="history-item">
          <div class="image">
            <a href="javascript:void(0)" @click="openVideo(item.url)" v-if="item.images">
              <img :src="item.images.xs" />
            </a>
          </div>
          <div class="description">
            <a href="javascript:void(0)" @click="openVideo(item.url)">
              {{ item.description }}
            </a>
          </div>
        </div>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>
<script>
import http from 'src/helpers/http';
import { mapGetters, mapMutations } from 'vuex';
import {
  VIDEO_MUTATION_SET_VIDEO_URL,
  VIDEO_GETTER_FULL_FILE,
} from 'src/data/video/types';
import replaceall from 'replaceall';

export default {
  name: 'video-top-bar',
  data() {
    return {
      modalOpen: false,
      clipboardOpen: false,
      history: [],
    };
  },
  computed: {
    ...mapGetters({
      fullFile: VIDEO_GETTER_FULL_FILE,
    }),
  },

  methods: {
    ...mapMutations({
      setVideoUrl: VIDEO_MUTATION_SET_VIDEO_URL,
    }),

    async loadHistory() {
      const response = await http.get('videos/history');
      this.history = response.data.history;
      this.openDialog();
    },
    openVideo(url) {
      this.setVideoUrl(url);
      this.closeDialog();
    },
    openDialog() {
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
    copy() {
      const fileCopy = [];

      const lines = this.fullFile;

      console.log(lines);

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

<style>
.history-item {
  padding-bottom: 5px;
  display: flex;
}

.history-item .description {
  padding: 5px;
}

@media (max-width: 600px) {
  .history-item .image {
    width: 100px;
  }
}
</style>
