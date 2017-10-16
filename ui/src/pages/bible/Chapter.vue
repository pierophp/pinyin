<template>
  <span class="bible-chapter-container">
    <div class="verses-container" v-show="showVerses">
      <div class="bible-verse special-action" @click="selectAll()">
          <md-icon>done_all</md-icon>
      </div>

      <div class="bible-verse special-action" @click="clear()">
          <md-icon>delete_sweep</md-icon>
      </div>

      <div v-for="(verse, verseId) in verses" v-bind:key="verseId" :class="['bible-verse', (selecteds.indexOf(verse) != -1) ? 'selected' : '']" @click="selectVerse(verse)">
          {{ verse }}
      </div>
    </div>

    <file-container ref="fileContainer" :lines="lines" :fullLines="chapter" :filename="filename" :fileLoading="fileLoading"/>
  </span>
</template>

<script>
  import chaptersData from 'src/data/bible/chapters';
  import axios from 'axios';
  import FileContainer from 'src/components/files/FileContainer';
  import LoadableContent from 'src/components/common/loading/LoadableContent';
  import _ from 'lodash';

  export default {
    name: 'bible-chapter',
    components: {
      FileContainer,
      LoadableContent,
    },
    data() {
      return {
        lines: [],
        chapter: [],
        showVerses: true,
        verses: [],
        selecteds: [],
        versesMap: {},
        fileLoading: false,
      };
    },
    methods: {
      clear() {
        this.selecteds = [];
        this.setFileContent([]);
      },
      setLine(line) {
        this.$set(this.lines, line.lineIndex, line.line);
      },
      setFileContent(lines) {
        this.lines = lines;
      },
      setFileLoading(loading) {
        this.fileLoading = loading;
      },
      selectAll() {
        this.setFileLoading(true);
        this.selecteds = [];
        this.setFileContent([]);
        this.loadFile(this.chapter, 0);
      },
      selectVerse(verse) {
        if (this.selecteds.indexOf(verse) === -1) {
          this.selecteds.push(verse);
        } else {
          this.selecteds.remove(this.selecteds.indexOf(verse));
        }

        this.selecteds = _.sortBy(this.selecteds);

        const newLines = [];

        const lines = {};

        this.selecteds.forEach((v) => {
          const verseMap = this.versesMap[v];
          if (!lines[verseMap.line]) {
            lines[verseMap.line] = {
              line: verseMap.line,
              blocks: [],
            };
          }

          for (let i = verseMap.blockStart; i <= verseMap.blockEnd; i += 1) {
            lines[verseMap.line].blocks.push(this.chapter[verseMap.line][i]);
          }
        });

        // eslint-disable-next-line
        for (const lineIndex in lines) {
          const line = lines[lineIndex];
          newLines.push(line.blocks);
        }

        this.setFileContent(newLines);
      },
      parseVerses(lines) {
        lines.forEach((line, lineIndex) => {
          let verse = null;
          line.forEach((block, blockIndex) => {
            if (block.v) {
              if (blockIndex > 0) {
                this.versesMap[block.v - 1].blockEnd = blockIndex - 1;
              }

              this.versesMap[block.v] = {
                line: lineIndex,
                blockStart: blockIndex,
                blockEnd: null,
              };

              verse = block.v;
            }
          });

          this.versesMap[verse].blockEnd = line.length - 1;
        });
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
      this.setFileContent([]);
      const CACHE_VERSION = 1;

      axios.get(`static/bible/cmn-hans/${this.$route.params.book}/${this.$route.params.chapter}.json?v=${CACHE_VERSION}`)
        .then((content) => {
          this.chapter = content.data.lines;
          this.parseVerses(content.data.lines);
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
  margin: 5px 5px 0 5px;
  max-height: 90px;
  overflow: scroll;
}

.bible-verse {
  color: #fff;
  line-height: 30px;
  height: 30px;
  width: 30px;
  background-color: #bab6b6;
  justify-content: flex-start;
  margin: 2px;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}
.special-action{
  background: #4c4a4a;
}

.selected {
  background: #275197;
}
</style>
