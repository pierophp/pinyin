<template>
  <md-dialog md-open-from="#filePasteModal" md-close-to="#filePasteModal" ref="modal" @open="onOpen" :md-active.sync="modalOpen">
    <md-dialog-title>{{ $t('paste') }}</md-dialog-title>

    <md-dialog-content>
      <md-input-container>
        <label for="action">{{ $t('action') }}</label>
        <md-select name="action" id="action" v-model="action">
          <md-option value="1">{{ $t('paste_action.multi_nwt') }}</md-option>
          <md-option value="2">{{ $t('paste_action.jw_language') }}</md-option>
          <md-option value="3">{{ $t('paste_action.jw_org') }}</md-option>
          <md-option value="4">{{ $t('paste_action.ideograms') }}</md-option>
        </md-select>
      </md-input-container>

      <md-input-container>
        <label for="action">{{ $t('paste') }}</label>
        <md-textarea v-model="textarea" ref="textarea"></md-textarea>
      </md-input-container>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click.native="closeDialog()">{{ $t('cancel') }}</md-button>
      <md-button class="md-primary" @click.native.prevent="confirm">{{ $t('ok') }}</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
  import {
      mapActions,
    } from 'vuex';

  import {
    FILE_ACTION_PARSE_PASTE,
  } from 'src/data/file/types';

  export default {
    name: 'modal-file-paste',
    data() {
      return {
        action: '3',
        textarea: '',
        modalOpen: false,
      };
    },
    methods: {
      confirm() {
        this.closeDialog('filePasteModal');
        this.parsePaste({
          action: this.action,
          content: this.textarea,
        });
        this.textarea = '';
      },
      openDialog() {
        this.modalOpen = true;
      },
      closeDialog() {
        this.modalOpen = false;
      },
      onOpen() {
        setTimeout(() => {
          this.$refs.textarea.$el.focus();
        }, 500);
      },
      ...mapActions({
        parsePaste: FILE_ACTION_PARSE_PASTE,
      }),
    },
  };
</script>

<style>
.md-dialog-content textarea{
  width:500px;
  min-height: 120px;
}

</style>
