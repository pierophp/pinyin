<template>
<div class="file-container">
  <loadable-content :loading="loading">
    <h2>{{filename}}</h2>
    <div class="larger-print">
      <file-row
        v-for="(line, index) in lines"
        v-bind:key="index"
        :line="line"
        :line-index="index"
        :data-index="index"
        drag-drop="{
          group: 'file-row',
          drop: {
              css: 'drop',
              method: moveElement
          }
        }"
        @open-file-paste-modal="$refs.filePasteModal.openDialog()"
        ></file-row>
      <div class="clearfix"></div>
      <div class="footer">
        <md-button class="md-raised md-primary" @click.native="addEmptyLine()">+ {{ $t("line") }}</md-button>
      </div>
    </div>
  </loadable-content>
  <file-paste-modal ref="filePasteModal"></file-paste-modal>
</div>
</template>

<script>
// import Vue from 'vue';
import FileRow from 'src/components/files/FileRow';
import FilePasteModal from 'src/components/modals/FilePaste';
import User from 'src/domain/user';
import LoadableContent from 'src/components/common/loading/LoadableContent';

import { mapActions, mapGetters, mapMutations } from 'vuex';

import {
  FILE_ACTION_FETCH,
  FILE_ACTION_CLEAR,
  FILE_ACTION_SAVE,
  FILE_GETTER,
  FILE_GETTER_PARSING,
  FILE_MUTATION_ADD_EMPTY_LINE,
} from 'src/data/file/types';

export default {
  name: 'file-details',

  components: {
    FileRow,
    FilePasteModal,
    LoadableContent,
  },

  data() {
    return {
      timer: null,
      filename: '',
    };
  },

  computed: {
    ...mapGetters({
      lines: FILE_GETTER,
      loading: FILE_GETTER_PARSING,
    }),
  },

  watch: {
    $route() {
      if (this.$route.params.filename) {
        this.getFile(this.$route.params.filename);
      }
    },
  },

  mounted() {
    this.getFile(this.$route.params.filename);

    this.timer = setInterval(() => {
      this.save({
        filename: this.filename,
        content: this.lines,
      });
    }, 3000);
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

    ...mapMutations({
      addEmptyLine: FILE_MUTATION_ADD_EMPTY_LINE,
    }),

    getFile(filename) {
      filename = `${this.$route.query.d}/${this.$route.params.filename}`;
      if (!this.lines.length || this.filename !== filename) {
        this.fetch(filename);
      }

      this.filename = filename;
    },

    logout() {
      User.logout();
    },
    // eslint-disable-next-line
    moveElement(draggedElement, droppedElement) {
      // const draggedIndex = draggedElement.getAttribute('data-index');
      // const droppedIndex = droppedElement.getAttribute('data-index');
      // console.log(draggedIndex);
      // console.log(droppedIndex);
      // const newDraggedElement = this.lines[draggedIndex];
      // const newDroppedElement = this.lines[droppedIndex];
      // Vue.set(this.lines, droppedIndex, newDraggedElement);
      // Vue.set(this.lines, draggedIndex, newDroppedElement);
    },
  },
};
</script>

<style>
.file-container {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
}
.md-list-item .md-list-item-holder > .md-icon:first-child {
  margin-right: 14px;
}
/* REMOVE THIS */
.modal-backdrop {
  z-index: -1;
}

.list {
}
.list li {
  font-size: 14px;
  font-family: Arial;
  color: #fff;
  background-color: #3879d9;
  padding: 7px 20px;
  border: 2px solid transparent;
  cursor: pointer;
}
.list li:hover {
  color: #3879d9;
  background-color: #fff;
  border: 2px solid #3879d9;
}
.list li.drag-start {
  background-color: #c56767;
}
.list li.drag-over {
  background-color: #67c58f;
}
.empty-container {
  font-size: 0;
}
.empty-container .column {
  display: inline-block;
  vertical-align: top;
}
.empty-container.two-column .column {
  width: 48.5%;
  margin-right: 1.5%;
}
.empty-container.two-column .column:nth-of-type(2n) {
  margin-right: 0;
}
</style>
