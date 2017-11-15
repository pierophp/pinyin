<template>
  <md-dialog ref="modal" :md-active.sync="modalOpen">
    <md-dialog-title>{{ $t('import_site') }}</md-dialog-title>

    <md-dialog-content>
      <md-field>
          <label>{{ $t("url") }}</label>
          <md-input type="text" ref="inputUrl" v-model="siteUrl"></md-input>
      </md-field>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click.native="closeDialog()">{{ $t('cancel') }}</md-button>
      <md-button class="md-primary" @click.native.prevent="confirm">{{ $t('import') }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
  import {
      mapActions,
    } from 'vuex';

  import {
    FILE_ACTION_IMPORT_FILE,
  } from 'src/data/file/types';

  export default {
    name: 'modal-delete-file',
    data() {
      return {
        siteUrl: '',
        modalOpen: false,
      };
    },
    props: {
      filename: '',
    },
    methods: {
      confirm() {
        this.closeDialog();
        this.importFile({
          content: this.siteUrl,
          filename: this.filename,
        });
        this.siteUrl = '';
      },
      onOpen() {
        setTimeout(() => {
          this.$refs.inputUrl.$el.focus();
        }, 500);
      },
      openDialog() {
        this.modalOpen = true;
        this.onOpen();
      },
      closeDialog() {
        this.modalOpen = false;
      },
      ...mapActions({
        importFile: FILE_ACTION_IMPORT_FILE,
      }),
    },
  };
</script>
