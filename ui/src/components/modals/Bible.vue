<template>
  <div>
    <md-dialog ref="modal" class="dialog-bible">
      <md-dialog-content>
        <chapter-container v-if="book" :book="book" :chapter="chapter" :verse="verse" @open-bottom-bar="openBottomBar"/>
      </md-dialog-content>

      <md-dialog-actions>
        <span class="bible-title">{{ booksName(book, 'cmn-hans') }} {{ chapter }}:{{ verse }}</span>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import chaptersData from 'src/data/bible/chapters';
  import ChapterContainer from 'src/components/bible/ChapterContainer';
  import booksName from 'src/data/bible/names';

  export default {
    name: 'modal-bible',
    props: {
      bookIndex: 0,
      chapter: 0,
      verse: 0,
    },
    computed: {
      book: function book() {
        const key = this.bookIndex - 1;
        if (key < 0) {
          return '';
        }

        return Object.keys(chaptersData)[key];
      },
    },
    components: {
      ChapterContainer,
    },
    methods: {
      booksName,
      openBottomBar(data) {
        this.$emit('open-bottom-bar', data);
      },
      openDialog() {
        this.$refs.modal.open();
      },
      closeDialog() {
        this.$refs.modal.close();
      },
    },
  };
</script>

<style>
.dialog-bible .md-dialog-title {
  margin: 0;
  padding: 15px 15px 0;
}

.dialog-bible .md-dialog-content {
  padding: 2px;
}

.dialog-bible .md-dialog{
  max-width: 90% !important;
  max-height: 90% !important;
}
.dialog-bible .md-dialog-actions {
  min-height: 42px;
  justify-content: space-between;
}

.dialog-bible .bible-title {
  font-size: 19px;
  color:#000 !important;
}
</style>
