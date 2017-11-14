<template>
  <div class="bible-save-container">
      Progresso: {{ percent }}%
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
      return {
        percent: 0,
        total: 1189,
      };
    },
    mounted() {
      this.save();
    },

    methods: {
      async save() {
        await window.frames['iframe-storage'].indexedDBOpen();
        const options = OptionsManager.getOptions();
        const language = `cmn-han${options.ideogramType}`;
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
    },
  };
</script>
