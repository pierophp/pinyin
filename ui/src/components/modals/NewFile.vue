<template>
  <div>
    <md-button class="md-fab md-fab-bottom-right" @click.native="openDialog()">
      <md-icon>add</md-icon>
    </md-button>

    <md-dialog md-open-from="#newFileModal" md-close-to="#newFileModal" ref="modal" @md-opened="onOpen" :md-active.sync="modalOpen" :md-fullscreen="false">
      <md-dialog-title>{{ $t('new_file') }}</md-dialog-title>

      <md-dialog-content>
         <md-field>
          <label>{{ $t('filename') }}</label>
          <md-input :placeholder="$t('filename')" v-model="filename" ref="inputFilename"></md-input>
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
  import {
      mapActions,
    } from 'vuex';

  import {
    FILE_ACTION_NEW_FILE,
  } from 'src/data/file/types';

  export default {
    name: 'modal-new-file',
    data() {
      return {
        filename: '',
        modalOpen: false,
      };
    },
    methods: {
      confirm() {
        this.closeDialog('newFileModal');
        this.newFile({
          filename: this.filename,
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
