<template>
  <div class="bible-books-container">
    <div class="bible-half">
      <div v-for="(book, bookId) in books.hebrew" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'fullName', 'color-' + book.color]" @click="goTo(book.name)">
          {{ booksName(book.name, exhibitionType) }}
        </div>
        <div :class="['bible-content', 'abbrName', 'color-' + book.color]" @click="goTo(book.name)">
          {{ booksName(book.name, exhibitionType + '-abbr') }}
        </div>
      </div>
    </div>

    <div class="bible-half">
      <div v-for="(book, bookId) in books.greek" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'fullName', 'color-' + book.color]" @click="goTo(book.name)">
          {{ booksName(book.name, exhibitionType) }}
        </div>
        <div :class="['bible-content', 'abbrName', 'color-' + book.color]" @click="goTo(book.name)">
          {{ booksName(book.name, exhibitionType + '-abbr') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import booksData from 'src/data/bible/books';
  import booksName from 'src/data/bible/names';

  export default {
    name: 'bible-books',
    data() {
      return {
        exhibitionType: 'cmn-hans',
        books: booksData,
      };
    },
    methods: {
      booksName,
      goTo(link) {
        this.$router.push(`/bible/${link}`);
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
  user-select: none;
}

.abbrName {
  display: none;
}

@media (max-width: 820px) {
  .bible-book {
    width: calc(100% / 5) !important;
  }
}

@media (max-width: 690px) {
  .fullName {
    display: none;
  }
  .abbrName {
    display: block;
  }
}

.bible-content {
  margin: 2px;
  padding: 10px 0 10px 15px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Noto Sans SC Sliced', 'Noto Sans TC', sans-serif;
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
