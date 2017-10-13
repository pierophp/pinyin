<template>
  <file-print/>
</template>

<script>
  import axios from 'axios';
  import FilePrint from 'src/pages/files/FilePrint';
  import LoadableContent from 'src/components/common/loading/LoadableContent';
  import {
    mapMutations,
  } from 'vuex';

  import {
    FILE_MUTATION_SET,
    FILE_MUTATION_SET_LINE,
    FILE_MUTATION_SET_FILE_LOADING,
    FILE_MUTATION_SET_FULL_FILE,
  } from 'src/data/file/types';

  export default {
    name: 'bible-chapter',
    components: {
      FilePrint,
      LoadableContent,
    },
    methods: {
      ...mapMutations({
        setFileContent: FILE_MUTATION_SET,
        setLine: FILE_MUTATION_SET_LINE,
        setFullFile: FILE_MUTATION_SET_FULL_FILE,
        setFileLoading: FILE_MUTATION_SET_FILE_LOADING,
      }),
      loadFile(lines, lineIndex) {
        if (lines.length === lineIndex) {
          this.setFileLoading(false);
          return;
        }

        const line = lines[lineIndex];

        this.setLine({
          line,
          lineIndex,
        });

        lineIndex += 1;
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.loadFile(lines, lineIndex);
            });
          });
        });
      },
    },
    async created() {
      this.setFileLoading(true);
      // this.setFileContent({ file: [] });

      const content = await axios.get(`static/bible/cmn-hans/${this.$route.params.book}/${this.$route.params.chapter}.json`);

      this.setFullFile({ file: content.data.lines });
      this.loadFile(content.data.lines, 0);
    },
  };
</script>
