<template>
  <file-container ref="fileContainer" 
    :lines="lines" 
    :fullLines="fullLines" 
    :filename="filename" 
    :fileLoading="fileLoading" 
    :parent="true" 
    :showHighlight="showHighlight"
    @go-to-video-time="(time) => $emit('go-to-video-time', time)"
    />
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import {
  FILE_ACTION_FETCH,
  FILE_ACTION_CLEAR,
  FILE_ACTION_SAVE,
  FILE_GETTER,
  FILE_GETTER_LOADING,
  FILE_GETTER_FULL_FILE,
} from 'src/data/file/types';

export default {
  name: 'file-print',

  data() {
    return {
      filename: '',
    };
  },
  props: {
    askToReload: {
      type: Boolean,
      default: true,
    },
    showHighlight: {
      type: Boolean,
      default: true,
    },
  },

  watch: {
    $route() {
      if (this.$route.params.filename) {
        this.getFile(`${this.$route.query.d}/${this.$route.params.filename}`);
      }
    },
  },

  computed: {
    ...mapGetters({
      lines: FILE_GETTER,
      fullLines: FILE_GETTER_FULL_FILE,
      fileLoading: FILE_GETTER_LOADING,
    }),
  },
  mounted() {
    if (this.askToReload) {
      if (!webpackHotUpdate) {
        window.onbeforeunload = () => '';
      }
    }

    this.filename = this.$route.params.filename;
    if (this.filename) {
      this.getFile(`${this.$route.query.d}/${this.$route.params.filename}`);
      this.timer = setInterval(() => {
        this.save({
          filename: `${this.$route.query.d}/${this.$route.params.filename}`,
          content: this.lines,
        });
      }, 3000);
    }
  },

  beforeDestroy() {
    if (this.askToReload) {
      window.onbeforeunload = null;
    }
    clearInterval(this.timer);
    this.clear();
  },
  methods: {
    ...mapActions({
      fetch: FILE_ACTION_FETCH,
      clear: FILE_ACTION_CLEAR,
      save: FILE_ACTION_SAVE,
    }),

    getFile(filename) {
      this.fetch(filename);
    },
  },
};
</script>
