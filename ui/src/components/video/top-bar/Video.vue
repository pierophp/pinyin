<template>
  <div>
    <md-button class="md-icon-button" @click="openDialog()">
      <md-icon>schedule</md-icon>
    </md-button>

    <md-dialog :md-active.sync="modalOpen" :md-fullscreen="false" :md-backdrop="true" :md-click-outside-to-close="true">
      <md-dialog-title>
        Histórico
      </md-dialog-title>

      <md-dialog-content>
        Histórico
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>
<script>
export default {
  name: 'video-top-bar',
  data() {
    return {
      modalOpen: false,
    };
  },
  methods: {
    openDialog() {
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
  },
};
</script>
