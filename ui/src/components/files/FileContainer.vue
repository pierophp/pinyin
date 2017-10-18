<template>
  <div class="print-container">
    <footnote-modal :line="footnoteLine" :lineIndex="footnoteLineIndex" ref="footnote"/>
    <image-zoom :src="imageZoom" ref="imageZoom"/>
    <div class="print-scroll">
      <div class="print" :class="[sizeClass, typeClass, ideogramSpacedClass]">
        <h2 v-if="filename">{{filename}}</h2>
        <div v-for="(line, lineIndex) in lines" :key="lineIndex">
          <div v-if="lineIndex === 0 && line[0].line !== undefined && line[0].line.audio !== undefined">
            <audio :src="line[0].line.audio" controls/>
          </div>
          <file-row-print
            :line="line"
            :lineIndex="lineIndex"
            @click.native="openBottomBarClick"
            @open-image="openImage"
            @open-footnote="openFootnote"
            ref="fileRowPrint"/>
        </div>
        <div class="loading-container">
          <md-spinner md-indeterminate v-if="fileLoading"></md-spinner>
        </div>

        <add-remove-character-modal
          @add-character="addCharacter"
          @remove-character="removeCharacter"
          ref="addRemoveCharacterModal"/>
        <highlight-modal/>

        <bible-modal ref="bibleModal" v-if="parent" :bookIndex="bible.bookIndex" :chapter="bible.chapter" :verse="bible.verse" @open-bottom-bar="openBottomBar"/>
      </div>
    </div>

    <file-bottom-bar ref="fileBottomBar" @open-modal="openModal"/>
  </div>
</template>

<script>
  import FileRowPrint from 'src/components/files/FileRowPrint';
  import FileBottomBar from 'src/components/files/FileBottomBar';
  import AddRemoveCharacterModal from 'src/components/modals/AddRemoveCharacter';
  import FootnoteModal from 'src/components/modals/Footnote';
  import HighlightModal from 'src/components/modals/Highlight';
  import BibleModal from 'src/components/modals/Bible';
  import OptionsManager from 'src/domain/options-manager';
  import ImageZoom from 'src/components/common/ImageZoom';

  import {
    mapActions,
    mapGetters,
  } from 'vuex';

  import {
    FILE_ACTION_FETCH_MY_CJK,
    FILE_GETTER_FOOTNOTES,
  } from 'src/data/file/types';

  // eslint-disable-next-line
  const PinyinWorker = require('worker-loader!src/workers/pinyin.js');

  export default {
    name: 'file-container',

    components: {
      FileRowPrint,
      AddRemoveCharacterModal,
      HighlightModal,
      FileBottomBar,
      FootnoteModal,
      BibleModal,
      ImageZoom,
    },

    props: {
      lines: {
        type: Array,
        default: () => [],
      },
      fullLines: {
        type: Array,
        default: () => [],
      },
      filename: '',
      fileLoading: false,
      parent: false,
    },

    data() {
      return {
        imageZoom: '',
        sizeClass: '',
        typeClass: '',
        ideogramSpacedClass: '',
        footnoteLine: null,
        footnoteLineIndex: null,
        bible: {
          bookIndex: 0,
          chapter: '',
          verse: '',
        },
      };
    },

    watch: {
      $route() {
        this.updateCss();
      },
    },

    computed: {
      ...mapGetters({
        footnotes: FILE_GETTER_FOOTNOTES,
      }),
    },
    created() {
      this.options = OptionsManager.getOptions();
      this.worker = new PinyinWorker();

      this.worker.addEventListener('message', (e) => {
        if (e.data.type === 'changeCharacter') {
          this.$refs.fileRowPrint[e.data.lineIndex].updateBlockRender(e.data.blockIndex);
        }
      });

      this.updateCss();
    },
    mounted() {
      this.fetchMyCjk();
    },

    methods: {
      ...mapActions({
        fetchMyCjk: FILE_ACTION_FETCH_MY_CJK,
      }),

      openImage(image) {
        this.imageZoom = image.src;
        this.$refs.imageZoom.openDialog();
      },

      openFootnote(footnote) {
        const footnoteIndex = parseInt(footnote.footnote, 10) - 1;
        if (this.footnotes[footnoteIndex] === undefined) {
          return;
        }
        const lineIndex = this.footnotes[footnoteIndex];
        this.footnoteLine = this.fullLines[lineIndex];
        this.footnoteLineIndex = lineIndex;
        this.$refs.footnote.openDialog();
      },

      openBottomBarClick(e) {
        const element = e.target.parentNode.parentNode;
        if (!element.classList.contains('character')) {
          return;
        }

        if (element.getAttribute('data-line') === null && element.getAttribute('data-block') === null) {
          return;
        }

        const lineIndex = element.getAttribute('data-line');
        const blockIndex = element.getAttribute('data-block');

        if (this.lines[lineIndex][blockIndex].b) {
          const bible = this.lines[lineIndex][blockIndex].b.split(':');
          this.bible.bookIndex = bible[0];
          this.bible.chapter = bible[1];
          this.bible.verse = bible[2];
          this.$refs.bibleModal.openDialog();
          return;
        }

        if (!this.parent) {
          this.$emit('open-bottom-bar', {
            pinyin: this.lines[lineIndex][blockIndex].p,
            character: this.lines[lineIndex][blockIndex].c,
            lineIndex,
            blockIndex,
            openDictionary: (e.ctrlKey || e.metaKey),
          });
          return;
        }

        this.openBottomBar({
          pinyin: this.lines[lineIndex][blockIndex].p,
          character: this.lines[lineIndex][blockIndex].c,
          lineIndex,
          blockIndex,
          openDictionary: (e.ctrlKey || e.metaKey),
        });
      },

      updateCss() {
        this.sizeClass = this.options.size;

        this.typeClass = '';
        if (this.options.type === '2') {
          this.typeClass = 'character-only';
        }

        this.ideogramSpacedClass = 'ideogram-spaced';
        if (this.options.ideogramSpaced === '0') {
          this.ideogramSpacedClass = '';
        }
      },

      openModal(add) {
        this.$refs.addRemoveCharacterModal.openDialog(add);
      },
      openBottomBar(block) {
        this.$refs.fileBottomBar.open(block);
      },

      addCharacter(character) {
        this.worker.postMessage({
          type: 'addCharacter',
          character,
          lines: this.lines,
          options: this.options,
        });
      },

      removeCharacter(character) {
        this.worker.postMessage({
          type: 'removeCharacter',
          character,
          lines: this.lines,
          options: this.options,
        });
      },
    },
  };
</script>

<style>
  :root {
    --larger-pinyin-font-size: 23px;
    --larger-character-font-size: 34px;
    --normal-pinyin-font-size: 15px;
    --normal-character-font-size: 22px;
  }

  ::selection {
    background: #a8d1ff !important;
    color: #000 !important;
  }


  .print-container{
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    overflow: hidden;
  }

  .print-scroll{
    flex: 1;
    will-change: transform;
    overflow: auto;
    padding: 0 10px;
  }

  .print{
    margin: 10px 2px;
    position: relative;
  }

  @media print{
    padding-top:0;
  }

  .character-only .pinyin {
    display: none;
  }

  .character-only .block {
    padding: 5px 0;
  }

  .print .pinyin,
  .print .pinyin span {
    user-select:none;
    background: none !important;
    font-size: var(--normal-pinyin-font-size);
    height: calc(var(--normal-pinyin-font-size) + 2px);
    min-width: 0;
  }

  .print .character,
  .print .character span {
    min-width: 0;
    font-family: 'Noto Sans SC Sliced', 'Noto Sans TC', sans-serif;
    font-weight: lighter;
  }

  .print .verse .ideogram-show span{
    font-size: 16px !important;
    width: auto !important;
    font-weight: bold;
  }

  .print .chapter .ideogram-show span{
    font-size: 32px !important;
    width: auto !important;
    font-weight: bold;
  }

  .larger.print .pinyin,
  .larger.print .pinyin span {
    font-size: var(--larger-pinyin-font-size);
    height: var(--larger-pinyin-font-size);
  }

  .larger .pinyin span {
    font-size: var(--larger-pinyin-font-size);
    height: var(--larger-pinyin-font-size);
    line-height: var(--larger-pinyin-font-size);
  }

  .larger .character span {
    font-size: var(--larger-character-font-size);
    height: var(--larger-character-font-size);
  }

  .print .type-box-img,
  .print .type-img {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .print .character span {
    display: inline-block;
    font-weight: 300;
    width: 22px;
  }

  .print .type-h1 .character span {
    line-height: 40px;
    font-size: 40px;
    width: 40px;
    font-weight: 400;
  }

  .print .type-h1 {
    border-top:1px solid#ff6363;
    border-bottom:1px solid #ff6363;
  }

  .print .type-box-h2,
  .print .type-h2 {
    border-top:1px solid#fcd79c;
    border-bottom:1px solid #fcd79c;
  }

  .print .type-box-h2 .character span,
  .print .type-h2 .character span {
    line-height: 34px;
    font-size: 34px;
    width: 33px;
    font-weight: 400;
  }

  .print .type-foot .pinyin span,
  .print .type-box-imgcaption .pinyin span,
  .print .type-imgcaption .pinyin span {
    line-height: 15px;
    font-size: 15px;
  }

  .print .type-foot .character span,
  .print .type-box-imgcaption .character span,
  .print .type-imgcaption .character span {
    line-height: 20px;
    font-size: 20px;
    width: 20px;
  }

  .print .type-box-h2,
  .print .type-box,
  .print .type-box-img,
  .print .type-box-imgcaption {
    border-left:3px solid #93c5ff;
    border-right:3px solid #93c5ff;
    padding: 0 10px;
  }

  .print .type-qu {
    border-top:1px solid #ccc;
    border-bottom:1px solid #ccc;
  }

  .print .type-qu .pinyin span {
    line-height: 17px;
    font-size: 15px;
    height: 20px;
  }

  .print .type-qu .character span {
    line-height: 19px;
    font-size: 19px;
    width: 19px;
  }

  .print .character span.special-ideogram {
    width: 17px;
  }

  .larger.print .character span {
    width: 34px;
  }

  .larger.print .type-h1 .character span {
    line-height: 50px;
    font-size: 50px;
    width: 48px;
  }

  .larger.print .type-box-h2 .character span,
  .larger.print .type-h2 .character span {
    line-height: 36px;
    font-size: 36px;
    width: 35px;
  }

  .larger.print .character span.special-ideogram {
    width: 24px;
  }

  .print .block {
    page-break-inside: avoid;
    padding: 1px 0;
    min-width: 0;
  }

  .print .block:hover {
    background: #fff;
  }

  .print a {
    color: #000;
    text-decoration: none;
  }

  .print .character:hover {
    cursor: pointer;
    opacity: 0.5;
  }

  .print .line {
    margin-bottom: 10px;
    padding-bottom: 15px;
  }

  .ideogram-spaced .block {
    margin-right: 4px;
  }

  .ideogram-spaced .type-h1 .block {
    margin-right: 15px;
  }

  .ideogram-spaced .type-box-h2 .block,
  .ideogram-spaced .type-h2 .block {
    margin-right: 10px;
  }

  .hide-pinyin {
    display: inline-block;
    width: 40px !important;
  }

  .highlight-1,
  .highlight-1:hover {
    background: #fffbce !important;
  }

  .highlight-2,
  .highlight-2:hover {
    background: #e4ffe2 !important;
  }

  .highlight-3,
  .highlight-3:hover {
    background: #e2faff !important;
  }

  .highlight-4,
  .highlight-4:hover {
    background: #fff2fe !important;
  }

  .clearfix {
    user-select: none;
  }

  .loading-container{
    text-align: center;
  }

  .image img {
    max-height:200px;
  }

  .bold span {
    font-weight: 500 !important;
  }

  audio {
    margin-top: 30px;
    margin-Bottom: 5px;
    width: 100%;
  }

  .print .block .footnote {
    font-size: 40px;
    color: #4286f4;
  }

</style>
