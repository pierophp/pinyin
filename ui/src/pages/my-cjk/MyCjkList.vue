<template>
  <div class="ideograms-container">
    <md-tabs>
      <md-tab id="ideograms" :md-label="$t('ideograms')">
        <loadable-content :loading="loading">
          <h3 v-if="options.type !== '4'">{{ $t('my_total') }}: {{total}}</h3>
          <table class="spaced-table">
            <thead>
              <tr>
                <th>{{ $t('freq.') }}</th>
                <th>{{ $t('my_ideograms') }}</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in report" :key="row.frequency">
                <td>{{ (row.frequency === 999) ? '-' : row.frequency }}</td>
                <td>
                  {{row.total_my}}
                  {{ (row.frequency === 999) ? '' : ('/ ' + row.total + ' (' + row.percent + '%)') }}
                </td>
                <td>
                  <menu-content>
                    <template slot="click">
                      <md-button class="md-raised md-primary">{{ $t('view') }}</md-button>
                    </template>

                    <div class="list-container">
                      <div
                        class="list-item"
                        @click="unknownIdeograms(row.frequency)"
                        v-if="row.frequency !== 999"
                      >
                        <div class="content">{{ $t("unknown") }}</div>
                      </div>
                      <div class="list-item" @click="knownIdeograms(row.frequency)">
                        <div class="content">{{ $t("known") }}</div>
                      </div>
                    </div>
                  </menu-content>
                </td>
              </tr>
            </tbody>
          </table>
        </loadable-content>
      </md-tab>

      <md-tab id="words" :md-label="$t('words')">
        <loadable-content :loading="loading">
          <h3 v-if="options.type !== '4'">{{ $t('my_total') }}: {{totalWords}}</h3>
          <table class="spaced-table">
            <thead>
              <tr>
                <th>HSK</th>
                <th>{{ $t('word') }}</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in reportWords" :key="row.hsk">
                <td>{{ (row.hsk === 999) ? '-' : row.hsk }}</td>
                <td>
                  {{row.total_my}}
                  {{ (row.hsk === 999) ? '' : ('/ ' + row.total + ' (' + row.percent + '%)') }}
                </td>
                <td>
                  <menu-content>
                    <template slot="click">
                      <md-button class="md-raised md-primary">{{ $t('action') }}</md-button>
                    </template>

                    <div class="list-container">
                      <div class="list-item" @click="unknownWords(row.hsk)" v-if="row.hsk !== 999">
                        <div class="content">{{ $t("unknown") }}</div>
                      </div>
                      <div class="list-item" @click="knownWords(row.hsk)">
                        <div class="content">{{ $t("known") }}</div>
                      </div>
                    </div>
                  </menu-content>
                </td>
              </tr>
            </tbody>
          </table>
        </loadable-content>
      </md-tab>
    </md-tabs>

    <my-cjk-list-modal
      :active.sync="dialogUnknownOpen"
      :items="reportUnkown"
      :hsk="hsk"
      :frequency="frequency"
      type="ideograms"
      action="unknown"
      @close="dialogUnknownOpen = false"
      @change="(selectedCharacter) => reportUnkown.remove(selectedCharacter)"
    />

    <my-cjk-list-modal
      :active.sync="dialogKnownOpen"
      :items="reportUnkown"
      :hsk="hsk"
      :frequency="frequency"
      type="ideograms"
      action="known"
      @close="dialogKnownOpen = false"
      @change="(selectedCharacter) => reportUnkown.remove(selectedCharacter)"
    />

    <my-cjk-list-modal
      :active.sync="dialogUnknownWordsOpen"
      :items="reportUnkown"
      :hsk="hsk"
      :frequency="frequency"
      type="words"
      action="unknown"
      @close="dialogUnknownWordsOpen = false"
      @change="(selectedCharacter) => reportUnkown.remove(selectedCharacter)"
    />

    <my-cjk-list-modal
      :active.sync="dialogKnownWordsOpen"
      :items="reportUnkown"
      :hsk="hsk"
      :frequency="frequency"
      type="words"
      action="known"
      @close="dialogKnownWordsOpen = false"
      @change="(selectedCharacter) => reportUnkown.remove(selectedCharacter)"
    />
  </div>
</template>

<script>
import http from 'src/helpers/http';
import LoadableContent from 'src/components/common/loading/LoadableContent';
import MyCjkListModal from 'src/components/modals/MyCjkList';
import OptionsManager from 'src/domain/options-manager';
import MenuContent from 'src/components/common/MenuContent';
const options = OptionsManager.getOptions();
let type = 'known';
if (options.type === '4') {
  type = 'unknown';
}

const source = options.hidePinyinSource;

export default {
  name: 'my-cjk-list',
  data() {
    return {
      loading: false,
      total: 0,
      totalWords: 0,
      hsk: 0,
      frequency: 0,
      report: [],
      reportWords: [],
      reportUnkown: [],
      dialogUnknownOpen: false,
      dialogKnownOpen: false,
      dialogUnknownWordsOpen: false,
      dialogKnownWordsOpen: false,
      ideogramsKnownWords: null,
      options,
    };
  },
  components: {
    LoadableContent,
    MyCjkListModal,
    MenuContent,
  },
  methods: {
    async knownIdeograms(frequency) {
      this.frequency = frequency;
      this.loading = true;
      http
        .get('my-cjk/report_known', {
          params: {
            frequency,
            ideogramType: options.ideogramType,
            type,
            source,
          },
        })
        .then(result => {
          this.loading = false;
          this.reportUnkown = result.data.ideograms;
          this.dialogKnownOpen = true;
        });
    },
    async unknownIdeograms(frequency) {
      this.frequency = frequency;
      this.loading = true;
      http
        .get('my-cjk/report_unknown', {
          params: {
            frequency,
            ideogramType: options.ideogramType,
            type,
            source,
          },
        })
        .then(result => {
          this.loading = false;
          this.reportUnkown = result.data.ideograms;
          this.dialogUnknownOpen = true;
        });
    },
    async knownWords(hsk) {
      this.hsk = hsk;
      this.loading = true;
      http
        .get('my-cjk/report_known_words', {
          params: {
            hsk,
            ideogramType: options.ideogramType,
            type,
            source,
          },
        })
        .then(result => {
          this.loading = false;
          this.reportUnkown = result.data.ideograms;
          this.dialogKnownWordsOpen = true;
        });
    },

    async unknownWords(hsk) {
      this.hsk = hsk;
      this.loading = true;
      http
        .get('my-cjk/report_unknown_words', {
          params: {
            hsk,
            ideogramType: options.ideogramType,
            type,
            source,
          },
        })
        .then(result => {
          this.loading = false;
          this.reportUnkown = result.data.ideograms;
          this.dialogUnknownWordsOpen = true;
        });
    },
    openDialog(ref) {
      this[`${ref}Open`] = true;
    },
    closeDialog(ref) {
      this[`${ref}Open`] = false;
    },
  },
  created() {
    http
      .get('my-cjk/report', {
        params: {
          ideogramType: options.ideogramType,
          type,
          source,
        },
      })
      .then(result => {
        this.total = result.data.total;
        this.report = result.data.report;
      });

    http
      .get('my-cjk/report_words', {
        params: {
          ideogramType: options.ideogramType,
          type,
          source,
        },
      })
      .then(result => {
        this.totalWords = result.data.total;
        this.reportWords = result.data.report;
      });

    http
      .get('my-cjk/ideograms_known_words', {
        params: {
          ideogramType: options.ideogramType,
          type,
          source,
        },
      })
      .then(result => {
        this.ideogramsKnownWords = result.data.total;
      });
  },
};
</script>

<style>
.ideograms-container {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
  margin-top: 20px;
}

.ideograms-container h3 {
  margin-top: 0px;
}

#ideograms .spaced-table,
#words .spaced-table {
  max-width: 650px;
}

#ideograms .spaced-table th,
#words .spaced-table th,
#ideograms .spaced-table td,
#words .spaced-table td {
  font-size: 16px;
}

#ideograms .spaced-table th:first-child {
  width: 20px;
}

.spaced-table .ideogram {
  font-family: 'Noto Sans SC', 'Noto Sans TC', sans-serif;
  font-size: 21px !important;
  font-weight: 300 !important;
}

.ideograms-container .md-tabs-content {
  height: auto !important;
}
</style>

