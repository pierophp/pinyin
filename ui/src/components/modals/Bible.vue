<template>
  <div>
    <md-dialog ref="modal">
      <md-dialog-title>
      </md-dialog-title>

      <md-dialog-content>
        <chapter-container book="genesis" chapter="1" verse="1"/>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import ChapterContainer from 'src/components/bible/ChapterContainer';

  export default {
    name: 'modal-bible',
    props: {
      line: '',
      lineIndex: '',
    },
    components: {
      ChapterContainer,
    },
    methods: {
      openDialog() {
        this.$refs.modal.open();
      },
      closeDialog() {
        this.$refs.modal.close();
      },
    },
  };
</script>
