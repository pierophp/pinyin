<template>
  <div>
    <div class="books-top-bar-container">
      <span @click="setShowPinyin(showPinyin ? 0 : 1)">
        <md-icon>translate</md-icon>
      </span>
      <span v-if="booksExhibitionType === '1'" @click="setType('2')">
        <md-icon>view_compact</md-icon>
      </span>
      <span v-if="booksExhibitionType === '2'" @click="setType('1')">
        <md-icon>view_module</md-icon>
      </span>
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
</style>
