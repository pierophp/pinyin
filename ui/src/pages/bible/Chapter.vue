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
    FILE_MUTATION_SET_FILE_LOADING,
  } from 'src/data/file/types';

  export default {
    name: 'bible-chapter',
    components: {
      FilePrint,
      LoadableContent,
    },
    data() {
      return {
        loading: true,
      };
    },
    methods: {
      ...mapMutations({
        setFileContent: FILE_MUTATION_SET,
        setFileLoading: FILE_MUTATION_SET_FILE_LOADING,
      }),
    },
    async created() {
      this.setFileLoading(true);
      const content = await axios.get(`static/bible/cmn-hans/${this.$route.params.book}/${this.$route.params.chapter}.json`);
      this.setFileContent({ file: content.data.lines });
      this.loading = false;
    },
  };
</script>

<style>
.bible-chapter-container {

}
</style>
