<template>
  <div>
    <v-btn icon @click="loadHistory()">
      <v-icon>schedule</v-icon>
    </v-btn>


    <v-btn icon @click.native="copy" v-if="fullFile && fullFile.length">
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

     <v-dialog
      v-model="modalOpen"
      width="500"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          {{ $t('history') }}
        </v-card-title>

        <v-card-text>
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
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click="closeDialog()"
          >
            {{ $t('close') }}
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

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
