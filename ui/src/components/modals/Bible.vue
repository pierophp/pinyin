<template>
  <div>
    <md-dialog ref="modal">
      <md-dialog-title>
        {{ book }} {{ chapter }} {{ verse }}
      </md-dialog-title>

      <md-dialog-content>
        <chapter-container v-if="book" :book="book" :chapter="chapter" :verse="verse" @open-bottom-bar="openBottomBar"/>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
  import chaptersData from 'src/data/bible/chapters';
  import ChapterContainer from 'src/components/bible/ChapterContainer';

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

<style scoped>
.md-dialog-title {
  margin: 0;
  padding: 15px 15px 0;
}
.md-dialog-content {
  padding: 2px;
}
</style>
