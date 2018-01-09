<template>
<div class="dictionary-container">
  <form novalidate @submit.stop.prevent="submit">
    <md-field>
      <md-icon>pageview</md-icon>
      <label>{{ $t("search") }}</label>
      <md-input type="text" ref="inputSearch" autofocus v-model="searchValue"></md-input>
    </md-field>
  </form>
  <div>
  <loadable-content :loading="loading">
    <md-list>
      <md-list-item v-for="entry in entries" @click="details(entry.id)" v-bind:key="entry.id">
        <span>
          <span class="ideogram">
            <traditional-simplified-show :pinyin="entry.pronunciation" :simplified="entry.ideogram" :traditional="entry.ideogramTraditional"/>
          </span
          ><span class="pinyin"> - {{ entry.pronunciation }}</span>
        </span>
      </md-list-item>
    </md-list>
    <div v-if="noResults">{{ $t("no_results") }}</div>
  </loadable-content>
  </div>
</div>
</template>

<script>
import http from 'src/helpers/http';
import LoadableContent from 'src/components/common/loading/LoadableContent';
import TraditionalSimplifiedShow from 'src/components/ideograms/TraditionalSimplifiedShow';
import replaceall from 'replaceall';

export default {
  name: 'dicionary-search',
  components: {
    LoadableContent,
    TraditionalSimplifiedShow,
  },
  data() {
    return {
      searchValue: '',
      entries: [],
      loading: false,
      noResults: false,
    };
  },
  watch: {
    searchValue() {
      this.search(this.searchValue);
    },
  },
  created() {
    setTimeout(() => {
      this.$refs.inputSearch.$el.focus();
      this.$refs.inputSearch.$el.setSelectionRange(0, 1000);
    }, 500);
  },
  mounted() {
    this.$nextTick(() => {
      this.searchValue = this.$route.query.search;
      if (this.searchValue) {
        this.search(this.searchValue);
      }
    });
  },
  methods: {
    search(value) {
      const that = this;
      (function search() {
        const searchValue = value;
        setTimeout(() => {
          if (searchValue === that.searchValue && searchValue) {
            that.noResults = false;
            that.loading = true;
            http
              .get('unihan/dictionary_search', {
                params: {
                  search: value,
                },
              })
              .then(response => {
                if (
                  replaceall(' ', '', value) ===
                  replaceall(' ', '', response.data.search)
                ) {
                  that.entries = response.data.entries;
                  that.loading = false;
                  if (that.entries.length === 0) {
                    that.noResults = true;
                  }
                }
              });
          }

          if (!searchValue) {
            that.entries = [];
            that.noResults = false;
          }
        }, 400);
      })();

      this.$router.push({
        path: this.$route.path,
        query: {
          search: value,
        },
      });
    },
    details(id) {
      this.$router.push({
        name: 'dictionary-details',
        query: {
          search: this.searchValue,
        },
        params: {
          id,
        },
      });
    },
  },
};
</script>

<style>
.dictionary-container {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
}

.dictionary-container .md-list {
  padding: 0;
}

.dictionary-container .md-input-container {
  margin-bottom: 15px;
}

.dictionary-container .ideogram {
  font-size: 20px;
}

.dictionary-container .md-list .ideogram-show span {
  display: inline-block;
  width: 20px;
}

.dictionary-container .pinyin {
  font-size: 20px;
}
</style>
