<template>
  <div class="books-top-bar-container">
    <span v-if="booksExhibitionType === '1'" @click="setType('2')">
      <md-icon>view_compact</md-icon>
    </span>
    <span v-if="booksExhibitionType === '2'" @click="setType('1')">
      <md-icon>view_module</md-icon>
    </span>
  </div>
</template>
<script>
  import {
    mapMutations,
    mapGetters,
  } from 'vuex';

  import {
    FILE_GETTER_BOOKS_EXHIBITION_TYPE,
    FILE_MUTATION_SET_BOOKS_EXHIBITION_TYPE,
  } from 'src/data/file/types';

  export default {
    name: 'bible-books-top-bar',
    methods: {
      ...mapMutations({
        setType: FILE_MUTATION_SET_BOOKS_EXHIBITION_TYPE,
      }),
    },
    computed: {
      ...mapGetters({
        booksExhibitionType: FILE_GETTER_BOOKS_EXHIBITION_TYPE,
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
