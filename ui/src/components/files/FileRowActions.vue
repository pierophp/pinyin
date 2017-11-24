<template>
  <md-menu md-align-trigger md-size="huge">
    <md-button class="md-accent" md-menu-trigger>{{ $t("options") }}</md-button>
    <md-menu-content>
      <md-menu-item @click.native="addEmptyBlock({lineIndex})">
        <md-icon>add</md-icon>
        <span class="md-list-item-text">{{ $t("add_empty_block") }}</span>
      </md-menu-item>
      <md-menu-item @click.native="convertToPinyin({lineIndex})">
        <md-icon>font_download</md-icon>
        <span class="md-list-item-text">{{ $t("convert_to_pinyin") }}</span>
      </md-menu-item>
      <md-menu-item @click.native="openModalClipBoard(lineIndex)">
        <md-icon>content_paste</md-icon>
        <span class="md-list-item-text">{{ $t("paste") }}</span>
      </md-menu-item>
      <md-menu-item @click.native="removeLine({lineIndex})">
        <md-icon>delete</md-icon>
        <span class="md-list-item-text">{{ $t("remove_line") }}</span>
      </md-menu-item>
    </md-menu-content>
  </md-menu>
</template>

<script>
  import {
    mapActions,
    mapMutations,
  } from 'vuex';

  import {
    FILE_ACTION_CONVERT_TO_PINYIN,
    FILE_MUTATION_ADD_EMPTY_BLOCK,
    FILE_MUTATION_PASTE_ACTION,
    FILE_MUTATION_REMOVE_LINE,
  } from 'src/data/file/types';

  export default {
    name: 'file-row-actions',
    props: {
      lineIndex: {
        default: 0,
      },
    },
    methods: {
      ...mapMutations({
        addEmptyBlock: FILE_MUTATION_ADD_EMPTY_BLOCK,
        removeLine: FILE_MUTATION_REMOVE_LINE,
        pasteAction: FILE_MUTATION_PASTE_ACTION,
      }),
      ...mapActions({
        convertToPinyin: FILE_ACTION_CONVERT_TO_PINYIN,
      }),
      openModalClipBoard(lineIndex) {
        this.$emit('open-file-paste-modal');
        this.pasteAction({
          lineIndex,
        });
      },
    },
  };
</script>
