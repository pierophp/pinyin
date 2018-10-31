<template>
  <div class="ideograms-container">
    <md-tabs>
      <md-tab id="ideograms" :md-label="$t('ideograms')">
        <loadable-content :loading="loading">
          <h3 v-if="options.type !== '4'">{{ $t('my_total') }}: {{total}}</h3>
          <md-table>

            <md-table-row>
              <md-table-head>{{ $t('freq.') }}</md-table-head>
              <md-table-head>{{ $t('my_ideograms') }}</md-table-head>
              <md-table-head></md-table-head>
            </md-table-row>

            <md-table-row v-for="row in report" :key="row.frequency">
              <md-table-cell>{{ (row.frequency === 999) ? '-' : row.frequency }}</md-table-cell>
              <md-table-cell>
                {{row.total_my}}
                {{ (row.frequency === 999) ? '' : ('/ ' + row.total + ' (' + row.percent + '%)') }}
              </md-table-cell>
              <md-table-cell>
                <md-menu md-size="medium" >
                  <md-button class="md-raised md-primary" md-menu-trigger>
                    {{ $t('view') }}
                  </md-button>
                  <md-menu-content>
                    <md-menu-item @click.native="unknownIdeograms(row.frequency)" v-if="row.frequency !== 999">
                      <span>{{ $t('unknown') }}</span>
                    </md-menu-item>
                    <md-menu-item @click.native="knownIdeograms(row.frequency)">
                      <span>{{ $t('known') }}</span>
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </loadable-content>
      </md-tab>

      <md-tab id="words" :md-label="$t('words')">
        <loadable-content :loading="loading">
        <h3 v-if="options.type !== '4'">{{ $t('my_total') }}: {{totalWords}}</h3>
          <md-table>
            <md-table-row>
              <md-table-head>HSK</md-table-head>
              <md-table-head>{{ $t('word') }}</md-table-head>
              <md-table-head></md-table-head>
            </md-table-row>

            <md-table-row v-for="row in reportWords" :key="row.hsk">
              <md-table-cell>{{ (row.hsk === 999) ? '-' : row.hsk }}</md-table-cell>
              <md-table-cell>{{row.total_my}}
                {{ (row.hsk === 999) ? '' : ('/ ' + row.total + ' (' + row.percent + '%)') }}
              </md-table-cell>
              <md-table-cell>
                <md-menu md-size="medium" >
                  <md-button class="md-raised md-primary" md-menu-trigger>
                    {{ $t('action') }}
                  </md-button>
                  <md-menu-content>
                    <md-menu-item @click.native="unknownWords(row.hsk)" v-if="row.hsk !== 999">
                      <span>{{ $t('unknown') }}</span>
                    </md-menu-item>
                    <md-menu-item @click.native="knownWords(row.hsk)">
                      <span>{{ $t('known') }}</span>
                    </md-menu-item>
                  </md-menu-content>
                </md-menu>
              </md-table-cell>
            </md-table-row>
          </md-table>
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
      options,
    };
  },
  components: {
    LoadableContent,
    MyCjkListModal,
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
  },
};
</script>

<style>
.md-table .md-icon {
  margin: auto !important;
}

.ideograms-container .md-table .md-table-head-text,
.ideograms-container .md-table .md-table-cell .md-table-cell-container {
  padding-left: 10px !important;
  padding-right: 10px !important;
}

.ideograms-container {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
  margin-top: 20px;
}

.ideograms-container h3 {
  margin-top: 0px;
}

#ideograms .md-table {
  max-width: 650px;
}

#ideograms .md-table th:first-child {
  width: 20px;
}

#words .md-table {
  max-width: 650px;
}

#ideograms .md-table-head-label,
#words .md-table-head-label {
  font-size: 16px !important;
}

#ideograms .md-table-cell-container,
#words .md-table-cell-container {
  font-size: 16px;
}

.ideogram .md-table-cell-container {
  font-family: 'Noto Sans SC', 'Noto Sans TC', sans-serif;
  font-size: 21px !important;
  font-weight: 300 !important;
}

.ideograms-container .md-table .md-table-head-label {
  padding-left: 0 !important;
}

.ideograms-container .md-table .md-table-cell .md-button {
  width: auto;
}

.ideograms-container .md-tabs-content {
  height: auto !important;
}
</style>

