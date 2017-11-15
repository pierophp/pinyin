<template>
  <div>
    <md-dialog ref="modal" :md-active.sync="modalOpen">
      <md-dialog-title>
      </md-dialog-title>

      <md-dialog-content>
        <div class="print">
          <file-row-print
                :line="line"
                :lineIndex="lineIndex"
                v-if="lineIndex"/>
        </div>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import FileRowPrint from 'src/components/files/FileRowPrint';

  export default {
    name: 'modal-footnote',
    props: {
      line: '',
      lineIndex: '',
    },
    components: {
      FileRowPrint,
    },
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
