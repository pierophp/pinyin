<template>
  <md-dialog ref="modal" :md-active.sync="modalOpen" :md-fullscreen="false">
    <md-dialog-title>{{ $t('delete_file') }}</md-dialog-title>

    <md-dialog-content>
      {{ $t('sure_delete_file') }}
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click.native="closeDialog()">{{ $t('cancel') }}</md-button>
      <md-button class="md-primary" @click.native.prevent="confirm">{{ $t('delete') }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
  import {
      mapActions,
    } from 'vuex';

  import {
    FILE_ACTION_DELETE_FILE,
  } from 'src/data/file/types';

  export default {
    name: 'modal-delete-file',
    props: {
      filename: '',
    },
    data() {
      return {
        modalOpen: false,
      };
    },
    methods: {
      confirm() {
        this.closeDialog();
        this.deleteFile({
          filename: this.filename,
        });
      },
      openDialog() {
        this.modalOpen = true;
      },
      closeDialog() {
        this.modalOpen = false;
      },
      ...mapActions({
        deleteFile: FILE_ACTION_DELETE_FILE,
      }),
    },
  };
</script>
