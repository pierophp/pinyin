<template>
  <div class="bible-chapters-container">
    <div v-for="(chapter, chapterId) in chapters" v-bind:key="chapterId" class="bible-chapter" @click="goTo(chapter.c)">
        {{ chapter.c }}
    </div>
  </div>
</template>

<script>
  import chaptersData from 'src/data/bible/chapters';

  export default {
    name: 'bible-chapters',
    data() {
      return {
        chapters: [],
      };
    },
    methods: {
      goTo(link) {
        this.$router.push(`/bible/${this.$route.params.book}/${link}`);
      },
    },
    created() {
      this.chapters = chaptersData[this.$route.params.book];
    },
  };
</script>

<style>
.bible-chapters-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width:100%;
  margin: 15px;
  overflow: auto;
}

.bible-chapter {
  color: #fff;
  line-height: 50px;
  height: 50px;
  width: 50px;
  background-color: #bab6b6;
  justify-content: flex-start;
  margin: 2px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
}

.bible-chapter:hover {
  background-color: #275197;
}

</style>
