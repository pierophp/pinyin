<template>
  <span class="bible-chapter-container">
    <div class="verses-container" v-show="showVerses">
      <div v-for="(verse, verseId) in verses" v-bind:key="verseId" class="bible-verse" @click="selectVerse(verse)">
          {{ verse }}
      </div>
    </div>

    <file-print/>
  </span>
</template>

<script>
  import chaptersData from 'src/data/bible/chapters';
  import axios from 'axios';
  import FilePrint from 'src/pages/files/FilePrint';
  import LoadableContent from 'src/components/common/loading/LoadableContent';
  import {
    mapMutations,
  } from 'vuex';

  import {
    FILE_MUTATION_SET,
    FILE_MUTATION_SET_LINE,
    FILE_MUTATION_SET_FILE_LOADING,
    FILE_MUTATION_SET_FULL_FILE,
  } from 'src/data/file/types';

  export default {
    name: 'bible-chapter',
    components: {
      FilePrint,
      LoadableContent,
    },
    data() {
      return {
        showVerses: false,
        verses: [],
      };
    },
    methods: {
      ...mapMutations({
        setFileContent: FILE_MUTATION_SET,
        setLine: FILE_MUTATION_SET_LINE,
        setFullFile: FILE_MUTATION_SET_FULL_FILE,
        setFileLoading: FILE_MUTATION_SET_FILE_LOADING,
      }),
      selectVerse() {

      },
      loadFile(lines, lineIndex) {
        if (lines.length === lineIndex) {
          this.setFileLoading(false);
          return;
        }

        const line = lines[lineIndex];

        this.setLine({
          line,
          lineIndex,
        });

        lineIndex += 1;
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.loadFile(lines, lineIndex);
            });
          });
        });
      },
    },
    async created() {
      this.setFileLoading(true);
      this.setFileContent({ file: [] });
      const CACHE_VERSION = 1;

      axios.get(`static/bible/cmn-hans/${this.$route.params.book}/${this.$route.params.chapter}.json?v=${CACHE_VERSION}`)
        .then((content) => {
          this.setFullFile({ file: content.data.lines });
          this.loadFile(content.data.lines, 0);
        });

      const chapter = chaptersData[this.$route.params.book][this.$route.params.chapter - 1];
      let initial = 1;
      if (chapter.i) {
        initial = chapter.i;
      }

      for (let i = initial; i <= chapter.t; i += 1) {
        this.verses.push(i);
      }
    },
  };
</script>

<style>
.bible-chapter-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  width:100%;
  overflow: auto;
}

.verses-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width: 100%;
  margin: 25px;
}

.bible-verse {
  color: #fff;
  line-height: 50px;
  height: 50px;
  width: 50px;
  background-color: #275197;
  justify-content: flex-start;
  margin: 2px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
}
</style>
