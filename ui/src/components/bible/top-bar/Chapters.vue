<template>
  <div>
    <span @click="goToBible" class="bible-title">
      <md-icon>arrow_back</md-icon>
      {{ booksName($route.params.book, exhibitionType) }}
    </span>
  </div>
</template>
<script>
import booksName from 'src/data/bible/names';
import OptionsManager from 'src/domain/options-manager';

const options = OptionsManager.getOptions();

export default {
  name: 'bible-chapters-top-bar',
  data() {
    return {
      exhibitionType: `cmn-han${options.ideogramType}`,
    };
  },
  methods: {
    booksName,
    goToBible() {
      this.$router.push('/bible');
    },
  },
};
</script>

<style>
.bible-title {
  cursor: pointer;
  font-size: 18px;
  font-family: 'Noto Sans SC Sliced', 'Noto Sans TC', sans-serif;
  color:#fff;
}
</style>
