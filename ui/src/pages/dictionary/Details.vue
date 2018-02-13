<template>
<div class="dictionary-container">
  <loadable-content :loading="loading">
    <h2>
      <traditional-simplified-show :pinyin="dictionary.pronunciation" :simplified="dictionary.ideograms" :traditional="dictionary.ideogramsTraditional"/>
      - {{ dictionary.pronunciation }} 
      
      <md-button class="md-icon-button md-primary clipboard-btn" v-clipboard="dictionary.ideograms" @success="clipboardSuccess">
          <md-icon>content_copy</md-icon>
      </md-button>

      <md-button class="md-icon-button md-accent sound-btn" @click.native="openSound">
        <md-icon>volume_up</md-icon>
      </md-button>
    </h2>

    <md-tabs>
      <md-tab id="dict" :md-label="$t('definition')">
        <dictionary-details :dictionary="dictionary" :pinyin="dictionary.pronunciation"/>
      </md-tab>

      <md-tab id="stroke" :md-label="$t('stroke')">
        <dictionary-stroke-order :ideograms="ideograms"/>
      </md-tab>

      <md-tab id="links" md-label="Links">
          <Links list=1 :character="dictionary.ideograms"/>
      </md-tab>
    </md-tabs>
  </loadable-content>

  <forvo-modal ref="dialogForvo" :character="dictionary.ideograms" />

  <md-snackbar md-position="center" :md-duration="1300" :md-active.sync="clipboardOpen">
    <span>{{ $t('copied_to_clipboard') }}</span>
  </md-snackbar>

  <md-button @click.native="back" class="md-fab md-fab-bottom-right md-warn">
    <md-icon>arrow_back</md-icon>
  </md-button>
</div>
</template>

<script>
import http from 'src/helpers/http';
import LoadableContent from 'src/components/common/loading/LoadableContent';
import DictionaryDetails from 'src/components/dictionary/Details';
import DictionaryStrokeOrder from 'src/components/dictionary/StrokeOrder';
import TraditionalSimplifiedShow from 'src/components/ideograms/TraditionalSimplifiedShow';
import ForvoModal from 'src/components/modals/Forvo';
import Links from 'src/components/ideograms/Links';
import OptionsManager from 'src/domain/options-manager';

const options = OptionsManager.getOptions();

export default {
  name: 'dicionary-search',
  components: {
    LoadableContent,
    DictionaryDetails,
    DictionaryStrokeOrder,
    TraditionalSimplifiedShow,
    ForvoModal,
    Links,
  },
  data() {
    return {
      forvoUrl: null,
      dictionary: {},
      loading: false,
      clipboardOpen: false,
    };
  },
  mounted() {
    this.search();
  },
  computed: {
    ideograms: function first() {
      if (options.ideogramType === 't') {
        return this.dictionary.ideogramsTraditional;
      }
      return this.dictionary.ideograms;
    },
  },
  methods: {
    search() {
      this.loading = true;
      http
        .get('unihan/dictionary', {
          params: {
            id: this.$route.params.id,
          },
        })
        .then(response => {
          this.dictionary = response.data;
          this.loading = false;
        });
    },
    back() {
      this.$router.push({
        name: 'dictionary',
        query: {
          search: this.$route.query.search,
        },
      });
    },
    openSound() {
      this.openDialog('dialogForvo');
    },
    openDialog(ref) {
      this.$refs[ref].open();
    },
    closeDialog(ref) {
      this.$refs[ref].close();
    },
    clipboardSuccess() {
      this.clipboardOpen = true;
    },
  },
};
</script>

<style>
.dictionary-container {
  flex: 1;
  padding: 0 10px 65px;
  overflow: auto;
}

.dictionary-container .md-input-container {
  margin-bottom: 15px;
}

.dictionary-container .md-tabs .md-tab {
  padding: 10px;
}
.dictionary-container h2 .ideogram-show span {
  display: inline-block;
  width: 30px;
}

.sound {
  cursor: pointer;
}

#forvo {
  width: 100%;
  height: 500px;
  border: 0;
}

.dictionary-container .md-tabs-content {
  height: auto !important;
}
</style>
