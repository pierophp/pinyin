<template>
  <div class="bible-books-container" :class="[exhibitionClass, exhibitionClassPinyin]">
    <div class="bible-half">
      <div v-for="(book, bookId) in books.hebrew" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'fullName', 'color-' + book.color]" @click="goTo(book.name)">
          <div v-if="showPinyin" class="pinyin-bible">{{ booksName(book.name, 'pinyin') }}</div>
          {{ booksName(book.name, exhibitionType) }}
        </div>
        <div :class="['bible-content', 'abbrName', 'color-' + book.color]" @click="goTo(book.name)">
          <div v-if="showPinyin" class="pinyin-bible">{{ booksName(book.name, 'pinyin-abbr') }}</div>
          {{ booksName(book.name, exhibitionType + '-abbr') }}
        </div>
      </div>
    </div>

    <div class="bible-half">
      <div v-for="(book, bookId) in books.greek" v-bind:key="bookId" class="bible-book">
        <div :class="['bible-content', 'fullName', 'color-' + book.color]" @click="goTo(book.name)">
          <div v-if="showPinyin" class="pinyin-bible">{{ booksName(book.name, 'pinyin') }}</div>
          {{ booksName(book.name, exhibitionType) }}
        </div>
        <div :class="['bible-content', 'abbrName', 'color-' + book.color]" @click="goTo(book.name)">
          <div v-if="showPinyin" class="pinyin-bible">{{ booksName(book.name, 'pinyin-abbr') }}</div>
          {{ booksName(book.name, exhibitionType + '-abbr') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import booksData from 'src/data/bible/books';
import booksName from 'src/data/bible/names';
import OptionsManager from 'src/domain/options-manager';

import { mapGetters } from 'vuex';

import {
  BIBLE_GETTER_BOOKS_SHOW_PINIYN,
  BIBLE_GETTER_BOOKS_EXHIBITION_TYPE,
} from 'src/data/bible/types';

export default {
  name: 'bible-books',
  data() {
    return {
      options: {},
      books: booksData,
    };
  },
  methods: {
    booksName,
    goTo(link) {
      this.$router.push(`/bible/${link}`);
    },
  },
  computed: {
    ...mapGetters({
      booksExhibitionType: BIBLE_GETTER_BOOKS_EXHIBITION_TYPE,
      showPinyin: BIBLE_GETTER_BOOKS_SHOW_PINIYN,
    }),
    exhibitionType() {
      return `cmn-han${this.options.ideogramType}`;
    },
    exhibitionClassPinyin() {
      if (this.showPinyin) {
        return 'pinyin';
      }

      return '';
    },
    exhibitionClass() {
      if (this.booksExhibitionType === '2') {
        return 'books-container-columns';
      }

      return '';
    },
  },
  created() {
    this.options = OptionsManager.getOptions();
  },
  mounted() {},
};
</script>

<style>
.bible-books-container {
  margin: 10px;
  overflow: auto;
}

.books-container-columns {
  display: flex;
}

.books-container-columns .bible-book {
  width: 100% !important;
}

.bible-half {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width: 100%;
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

  .books-container-columns .fullName {
    display: block !important;
  }

  .books-container-columns .abbrName {
    display: none !important;
  }
}

.bible-content {
  margin: 2px;
  padding: 10px 0 10px 10px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Noto Sans SC', 'Noto Sans TC', sans-serif;
}

.pinyin .bible-content {
  padding: 1px 0 1px 10px;
}

.pinyin .bible-content .pinyin-bible {
  height: 15px;
  font-size: 11px;
  font-family: Roboto;
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
