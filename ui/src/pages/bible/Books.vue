<template>
  <div class="bible-books-container">
    <div class="bible-half">
      <div v-for="(book, bookId) in books.hebrew" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'color-' + book.color]" @click="goTo(book.name)">
          {{ book.name }}
        </div>
      </div>
    </div>

    <div class="bible-half">
      <div v-for="(book, bookId) in books.greek" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'color-' + book.color]" @click="goTo(book.name)">
          {{ book.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import booksData from 'src/data/bible/books';

  export default {
    name: 'bible-books',
    data() {
      return {
        books: booksData,
      };
    },
    methods: {
      goTo(link) {
        this.$router.push(`bible/${link}`);
      },
    },
    mounted() {

    },
  };
</script>

<style>
.bible-books-container {
  margin: 10px;
  overflow: auto;
}

.bible-half {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width:100%;
  margin-bottom: 25px;
}

.bible-book {
  width: calc(100% / 6);
  color: #fff;
  justify-content: flex-start;
}

@media (max-device-width : 480px) {
  .bible-book {
    width: calc(100% / 5) !important;
  }
}

.bible-content {
  margin: 2px;
  padding: 10px 0 10px 15px;
  cursor: pointer;
}

.color-1 {
  background-color: #4a6da7;
}

.color-2 {
  background-color: #275197;
}

.color-3 {
  background-color: #1d3254;
}
</style>
