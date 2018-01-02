<template>
<span>
    <span v-if="filenameRender">{{ filenameRender }}</span>
    <file-row-print
      v-if="!filenameRender"
      :line="line"
      :lineIndex="0"
      >
    </file-row-print>
</span>
</template>

<script>
import FileRowPrint from 'src/components/files/FileRowPrint';

export default {
  name: 'filename',
  components: {
    FileRowPrint,
  },

  data() {
    return {
      filenameRender: '',
      line: [],
    };
  },

  watch: {
    filename() {
      this.update();
    },
  },
  props: {
    filename: '',
  },

  created() {
    this.update();
  },

  methods: {
    update() {
      const fileSplit = this.filename.split('|||');
      this.filenameRender = this.filename;

      this.line = [];
      if (fileSplit.length === 3) {
        this.filenameRender = '';
        const pinyinList = fileSplit[2].split(String.fromCharCode(160));
        let i = 0;
        fileSplit[1].split(' ').forEach(word => {
          const pinyin = [];
          // eslint-disable-next-line
          for (const w of word) {
            pinyin.push(pinyinList[i]);
            i += 1;
          }

          this.line.push({
            c: word,
            p: pinyin.join(String.fromCharCode(160)),
          });
        });
      }
    },
  },
};
</script>

<style>
.line {
  display: block;
}

.block {
  display: inline-block;
  width: auto;
}

.block:hover {
  background: inherit;
}

.block .ideogram-show span {
  font-size: 20px !important;
}

.pinyin span {
  background: inherit;
}
</style>
