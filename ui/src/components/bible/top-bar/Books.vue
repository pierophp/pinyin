<template>
  <div>
    <div class="books-top-bar-container">

      <md-button class="md-icon-button" @click="setShowPinyin(showPinyin ? 0 : 1)">
        <md-icon>translate</md-icon>
      </md-button>

      <md-button class="md-icon-button" v-if="booksExhibitionType === '1'" @click="setType('2')">
        <md-icon>view_compact</md-icon>
      </md-button>

      <md-button class="md-icon-button" v-if="booksExhibitionType === '2'" @click="setType('1')">
        <md-icon>view_module</md-icon>
      </md-button>

      <md-button class="md-icon-button" @click="$router.push('/bible/save')">
        <md-icon>cloud_download</md-icon>
      </md-button>
    </div>
  </div>
</template>
<script>
  import {
    mapMutations,
    mapGetters,
  } from 'vuex';

  import {
    FILE_GETTER_BOOKS_EXHIBITION_TYPE,
    FILE_GETTER_BOOKS_SHOW_PINIYN,
    FILE_MUTATION_SET_BOOKS_EXHIBITION_TYPE,
    FILE_MUTATION_SET_BOOKS_SHOW_PINYIN,
  } from 'src/data/file/types';

  export default {
    name: 'bible-books-top-bar',
    methods: {
      ...mapMutations({
        setType: FILE_MUTATION_SET_BOOKS_EXHIBITION_TYPE,
        setShowPinyin: FILE_MUTATION_SET_BOOKS_SHOW_PINYIN,
      }),
    },
    computed: {
      ...mapGetters({
        booksExhibitionType: FILE_GETTER_BOOKS_EXHIBITION_TYPE,
        showPinyin: FILE_GETTER_BOOKS_SHOW_PINIYN,
      }),
    },
  };
</script>

<style>
div[options="bible-books"] {
  text-align:right;
}

.books-top-bar-container span {
  cursor: pointer;
}

.books-top-bar-container .md-icon-button {
  margin: 0;
}
</style>
