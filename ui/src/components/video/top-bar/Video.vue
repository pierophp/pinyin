<template>
  <div>
    <md-button class="md-icon-button" @click="loadHistory()">
      <md-icon>schedule</md-icon>
    </md-button>

    <md-dialog :md-active.sync="modalOpen" :md-fullscreen="false" :md-backdrop="true" :md-click-outside-to-close="true">
      <md-dialog-title>
        Histórico
      </md-dialog-title>

      <md-dialog-content>
        <div v-for="(item, itemId) in history" v-bind:key="itemId" class="history-item">
          <div class="image">
            <a href="javascript:void(0)" @click="openVideo(item.url)">
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

export default {
  name: 'video-top-bar',
  data() {
    return {
      modalOpen: false,
      history: [],
    };
  },
  methods: {
    async loadHistory() {
      const response = await http.get('videos/history');
      this.history = response.data.history;
      this.openDialog();
    },
    openVideo(url) {
      console.log(url);
    },
    openDialog() {
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
  },
};
</script>

<style>
.history-item {
  padding-bottom: 5px;
  display: flex;
}

.history-item .description{
  padding: 5px;
}


@media (max-width: 600px)
{
  .history-item .image {
    width: 100px;
  }
}

</style>
