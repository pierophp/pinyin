<template>
  <div>
    <md-dialog md-open-from="#addCharacterModal" md-close-to="#addCharacterModal" ref="modal" :md-active.sync="modalOpen" :md-fullscreen="false">
      <md-dialog-title v-if="add">{{ $t('add_ideogram') }}</md-dialog-title>
      <md-dialog-title v-if="!add">{{ $t('remove_ideogram') }}</md-dialog-title>
      <md-dialog-content>
        <span v-if="add">{{ $t('confirmation_add_ideogram', { ideogram: myCjkTemp}) }}</span>
        <span v-if="!add">{{ $t('confirmation_remove_ideogram', { ideogram: myCjkTemp}) }}</span>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('cancel') }}</md-button>
        <md-button class="md-primary" @click.native.prevent="confirm">{{ $t('ok') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import {
  FILE_ACTION_ADD_MY_CJK,
  FILE_ACTION_REMOVE_MY_CJK,
  FILE_GETTER_MY_CJK_TEMP,
} from 'src/data/file/types';

export default {
  name: 'modal-add-character',
  computed: {
    ...mapGetters({
      myCjkTemp: FILE_GETTER_MY_CJK_TEMP,
    }),
  },
  data() {
    return {
      add: true,
      modalOpen: false,
    };
  },
  methods: {
    confirm() {
      this.closeDialog('addCharacterModal');
      if (this.add) {
        this.addMyCjk({
          myCjk: this.myCjkTemp,
        }).then(() => {
          this.$emit('add-character', this.myCjkTemp);
        });
      } else {
        this.removeMyCjk({
          myCjk: this.myCjkTemp,
        }).then(() => {
          this.$emit('remove-character', this.myCjkTemp);
        });
      }
    },
    openDialog(add) {
      this.add = add;
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
    ...mapActions({
      addMyCjk: FILE_ACTION_ADD_MY_CJK,
      removeMyCjk: FILE_ACTION_REMOVE_MY_CJK,
    }),
  },
};
</script>
