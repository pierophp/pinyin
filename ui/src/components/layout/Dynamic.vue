<template>
  <div :class="topBarClass">
    <dictionary-top-bar v-if="topBar == 'dictionary'"/>
    <file-details-top-bar v-if="topBar == 'file-details'"/>
    <file-print-top-bar v-if="topBar == 'file-print'"/>
    <bible-books-top-bar v-if="topBar == 'bible-books'"/>
    <bible-chapters-top-bar v-if="topBar == 'bible-chapters'"/>
    <bible-chapter-top-bar v-if="topBar == 'bible-chapter'"/>
  </div>
</template>
<script>
  import DictionaryTopBar from 'src/components/dictionary/top-bar/Dictionary';
  import FileDetailsTopBar from 'src/components/files/top-bar/FileDetails';
  import FilePrintTopBar from 'src/components/files/top-bar/FilePrint';
  import BibleBooksTopBar from 'src/components/bible/top-bar/Books';
  import BibleChaptersTopBar from 'src/components/bible/top-bar/Chapters';
  import BibleChapterTopBar from 'src/components/bible/top-bar/Chapter';

  export default {
    components: {
      DictionaryTopBar,
      FileDetailsTopBar,
      FilePrintTopBar,
      BibleBooksTopBar,
      BibleChaptersTopBar,
      BibleChapterTopBar,
    },
    watch: {
      $route() {
        this.topBar = this.$route.meta.topBar;
        this.topBarClass = 'md-toolbar-section-end';
        if (this.$route.meta.topBarLeft) {
          this.topBarClass = '';
        }
      },
    },
    data() {
      let topBarClass = 'md-toolbar-section-end';
      if (this.$route.meta.topBarLeft) {
        topBarClass = '';
      }

      return {
        topBarClass,
        topBar: this.$route.meta.topBar,
      };
    },
  };
</script>
