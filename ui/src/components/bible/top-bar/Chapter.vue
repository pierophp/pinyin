<template>
  <div>
    <span @click="goToChapters" class="bible-title">
      <md-icon>arrow_back</md-icon>
      {{ booksName($route.params.book, exhibitionType) }}
      {{ $route.params.chapter }}
    </span>
  </div>
</template>
<script>
import booksName from 'src/data/bible/names';
import OptionsManager from 'src/domain/options-manager';

const options = OptionsManager.getOptions();

export default {
  name: 'bible-chapter-top-bar',
  data() {
    return {
      exhibitionType: `cmn-han${options.ideogramType}`,
    };
  },
  methods: {
    booksName,
    goToChapters() {
      this.$router.push(`/bible/${this.$route.params.book}`);
    },
  },
};
</script>

<style>
.bible-title{
  cursor: pointer;
  font-size: 18px;
  font-family: 'Noto Sans SC Sliced', 'Noto Sans TC', sans-serif;
  color:#fff;
}
</style>
