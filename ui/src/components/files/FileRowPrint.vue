<template>
  <div class="line" :class=[type]>
    <file-row-translation :line="line" />
    <file-block-print
      v-for="(block,index) in line"
      :block="block"
      :pinyin="block.p"
      :character="block.c"
      :isBold="block.isBold ? 1 : 0"
      :isItalic="block.isItalic ? 1 : 0"
      :highlight="block.h"
      :line-index="lineIndex"
      :block-index="index"
      :key="index"
      @open-image="openImage"
      @open-footnote="openFootnote"
      ref="fileBlockPrint"
      >
    </file-block-print>

    <div class="clearfix"></div>
  </div>
</template>

<script>
  import FileBlockPrint from 'src/components/files/FileBlockPrint';
  import FileRowTranslation from 'src/components/files/FileRowTranslation';

  export default {
    name: 'file-row',
    components: {
      FileBlockPrint,
      FileRowTranslation,
    },
    data() {
      return {
        type: '',
      };
    },
    props: {
      line: {
        type: Array,
        default: () => ([]),
      },
      lineIndex: {
        default: 0,
      },
    },
    created() {
      this.type = '';
      if (this.line[0] !== undefined && this.line[0].line !== undefined) {
        const type = this.line[0].line.type;
        this.type = `type-${type}`;
      }
    },
    methods: {
      openImage(image) {
        this.$emit('open-image', image);
      },
      openFootnote(footnote) {
        this.$emit('open-footnote', footnote);
      },
      updateBlockRender(blockIndex) {
        this.$refs.fileBlockPrint[blockIndex].updateRender();
      },
    },
  };
</script>
