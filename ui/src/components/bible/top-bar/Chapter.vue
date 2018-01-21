<template>
  <div class="chapter-top-bar-container">
    <div class="left">
      <span @click="goToChapters" class="bible-title">
        <md-icon>arrow_back</md-icon>
        {{ booksName($route.params.book, exhibitionType) }}
        {{ $route.params.chapter }}
      </span>

      <md-button class="md-icon-button" @click="openModal()" v-if="versesShowAsModal">
        <md-icon>view_module</md-icon>
      </md-button>
    </div>

    <div class="right">
      <md-button class="md-icon-button" @click="openDialog()" >
        <md-icon>more_vert</md-icon>
      </md-button>
    </div>

    <md-dialog ref="modal" class="dialog-chapter-options" :md-active.sync="modalOpen" :md-fullscreen="false" :md-backdrop="true" :md-click-outside-to-close="true">
      <md-dialog-content>
        <md-switch v-model="versesShowAsModalInput">
          {{ $t('open_verses_as_popup') }}
        </md-switch><br/>
        <md-switch v-model="openChapterOnLoadInput">
          {{ $t('open_chapter_on_load') }}
        </md-switch>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">{{ $t('close') }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>
<script>
import booksName from 'src/data/bible/names';
import OptionsManager from 'src/domain/options-manager';
import { mapMutations, mapGetters } from 'vuex';

import {
  BIBLE_GETTER_VERSES_SHOW_AS_MODAL,
  BIBLE_GETTER_OPEN_CHAPTER_ON_LOAD,
  BIBLE_MUTATION_SET_VERSES_MODAL_VISIBLE,
  BIBLE_MUTATION_SET_VERSES_SHOW_AS_MODAL,
  BIBLE_MUTATION_SET_OPEN_CHAPTER_ON_LOAD,
} from 'src/data/bible/types';

export default {
  name: 'bible-chapter-top-bar',
  data() {
    return {
      options: {},
      modalOpen: false,
      versesShowAsModalInput: false,
      openChapterOnLoadInput: false,
    };
  },
  watch: {
    versesShowAsModalInput() {
      this.setVersesShowAsModal(this.versesShowAsModalInput);
    },
    openChapterOnLoadInput() {
      this.setOpenChapterOnLoad(this.openChapterOnLoadInput);
    },
  },
  computed: {
    ...mapGetters({
      versesShowAsModal: BIBLE_GETTER_VERSES_SHOW_AS_MODAL,
      openChapterOnLoad: BIBLE_GETTER_OPEN_CHAPTER_ON_LOAD,
    }),

    exhibitionType() {
      return `cmn-han${this.options.ideogramType}`;
    },
  },
  created() {
    this.options = OptionsManager.getOptions();
    if (this.versesShowAsModal && !this.openChapterOnLoad) {
      this.setVersesModalVisible(true);
    }
  },
  mounted() {
    this.versesShowAsModalInput = !!this.versesShowAsModal;
    this.openChapterOnLoadInput = !!this.openChapterOnLoad;
  },
  methods: {
    ...mapMutations({
      setVersesModalVisible: BIBLE_MUTATION_SET_VERSES_MODAL_VISIBLE,
      setVersesShowAsModal: BIBLE_MUTATION_SET_VERSES_SHOW_AS_MODAL,
      setOpenChapterOnLoad: BIBLE_MUTATION_SET_OPEN_CHAPTER_ON_LOAD,
    }),
    booksName,
    goToChapters() {
      this.$router.push(`/bible/${this.$route.params.book}`);
    },
    openModal() {
      this.setVersesModalVisible(true);
    },
    openDialog() {
      this.modalOpen = true;
    },
    closeDialog() {
      this.modalOpen = false;
    },
  },
};
</script>

<style>
.bible-title {
  cursor: pointer;
  font-size: 18px;
  font-family: 'Noto Sans SC', 'Noto Sans TC', sans-serif;
  color: #fff;
}

.chapter-top-bar-container {
  width: 100%;
  display: flex;
  align-items: center;
}

.chapter-top-bar-container .left {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.chapter-top-bar-container .right {
  display: flex;
  align-items: center;
}
</style>
