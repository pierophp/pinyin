<template>
  <file-container ref="fileContainer" :lines="lines" :fullLines="fullLines" :filename="filename" :fileLoading="fileLoading" :parent="true"/>
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

  watch: {
    $route() {
      if (this.$route.params.filename) {
        this.getFile(this.$route.params.filename);
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
    this.filename = this.$route.params.filename;
    if (this.filename) {
      this.getFile(this.filename);
      this.timer = setInterval(() => {
        this.save({
          filename: this.filename,
          content: this.lines,
        });
      }, 3000);
    }
  },

  beforeDestroy() {
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
