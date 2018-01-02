<template>
  <div>
    <md-button class="md-fab md-fab-bottom-right" @click.native="openDialog()">
      <md-icon>add</md-icon>
    </md-button>

    <md-dialog md-open-from="#newFileModal" md-close-to="#newFileModal" ref="modal" @md-opened="onOpen" :md-active.sync="modalOpen" :md-fullscreen="false">
      <md-dialog-title>{{ $t('new') }}</md-dialog-title>

      <md-dialog-content >
        <md-field>
          <label>{{ $t('type') }}</label>
           <md-select v-model="type" name="type" md-dense id="select-type">
            <md-option value="file">{{ $t('file') }}</md-option>
            <md-option value="dir">{{ $t('folder') }}</md-option>
          </md-select>
        </md-field>

        <md-field>
          <label>{{ $t('name') }}</label>
          <md-input :placeholder="$t('name')" v-model="filename" ref="inputFilename"></md-input>
        </md-field>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('cancel') }}</md-button>
        <md-button class="md-primary" @click.native.prevent="confirm">{{ $t('ok') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import { FILE_ACTION_NEW_FILE } from 'src/data/file/types';

export default {
  name: 'modal-new-file',
  data() {
    return {
      type: 'file',
      filename: '',
      modalOpen: false,
    };
  },
  methods: {
    confirm() {
      this.closeDialog('newFileModal');
      this.newFile({
        filename: this.filename,
        type: this.type,
        dirname: this.$route.query.d ? this.$route.query.d : '/',
      });
      this.filename = '';
    },
    openDialog() {
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
    onOpen() {
      setTimeout(() => {
        this.$refs.inputFilename.$el.focus();
      }, 100);
    },
    ...mapActions({
      newFile: FILE_ACTION_NEW_FILE,
    }),
  },
};
</script>

<style>
.md-select-menu {
  z-index: 1000 !important;
}
</style>
