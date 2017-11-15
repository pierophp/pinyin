<template>
  <div class="bible-save-container">
      <div>
        Progresso: {{ percent }}%
        <md-progress-bar md-mode="determinate" :md-value="percent"></md-progress-bar>
      </div>
      <md-table>
        <md-table-header>
          <md-table-row>
            <md-table-head>{{ $t('language') }}</md-table-head>
            <md-table-head></md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <md-table-row v-for="(language, index) in languages" :key="index">
            <md-table-cell>
              {{ language.language }}
            </md-table-cell>
            <md-table-cell class="cell-button">
              <md-button class="md-icon-button md-raised" @click.native="save(language.code)" v-if="!language.downloaded">
                <md-icon>add</md-icon>
              </md-button>

              <md-button class="md-icon-button md-raised" @click.native="remove(language.code)" v-if="language.downloaded">
                <md-icon>remove</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
  </div>
</template>

<script>
  import chaptersData from 'shared/data/bible/chapters';
  import axios from 'axios';
  import Promise from 'bluebird';
  import OptionsManager from 'src/domain/options-manager';
  import LocalStorage from 'src/helpers/local-storage';

  const CACHE_VERSION = 1;

  export default {
    name: 'bible-save',
    data() {
      const languages = OptionsManager.getLanguages(true);
      languages.forEach((language, languageIndex) => {
        languages[languageIndex].downloaded = LocalStorage.has(`BIBLE_SAVE_${language.code}`);
      });

      return {
        downloading: false,
        percent: 0,
        total: 1189,
        languages,
      };
    },
    mounted() {
      // this.save();
    },

    methods: {

      async save(language) {
        await window.frames['iframe-storage'].indexedDBOpen();
        let count = 0;
        await Promise.mapSeries(Object.keys(chaptersData), async (book) => {
          await Promise.mapSeries(Object.keys(chaptersData[book]), async (chapterIndex) => {
            count += 1;
            this.percent = ((count * 100) / this.total).toFixed(2);

            const chapter = chaptersData[book][chapterIndex].c;

            const text = await axios.get(`static/bible/${language}/${book}/${chapter}.json?v=${CACHE_VERSION}`);

            await window.frames['iframe-storage'].indexedDBPut('bible', {
              key: `${language}_${book}_${chapter}`,
              language,
              book,
              chapter,
              text: JSON.stringify(text.data),
            });
          });

          LocalStorage.save(`BIBLE_SAVE_${language}`, 1);
        });
      },

      async remove(language) {
        await window.frames['iframe-storage'].indexedDBOpen();
        let count = 0;
        await Promise.mapSeries(Object.keys(chaptersData), async (book) => {
          await Promise.mapSeries(Object.keys(chaptersData[book]), async (chapterIndex) => {
            count += 1;
            this.percent = ((count * 100) / this.total).toFixed(2);

            const chapter = chaptersData[book][chapterIndex].c;

            await window.frames['iframe-storage'].indexedDBDelete('bible', `${language}_${book}_${chapter}`);
          });

          LocalStorage.remove(`BIBLE_SAVE_${language}`);
        });
      },
    },
  };
</script>


<style>
.bible-save-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width:100%;
  margin: 15px;
  overflow: auto;
}
</style>
