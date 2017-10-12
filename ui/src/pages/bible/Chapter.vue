<template>
  <div class="bible-chapter-container">
    <file-print/>
  </div>
</template>

<script>
  import axios from 'axios';
  import FilePrint from 'src/pages/files/FilePrint';
  import {
    mapMutations,
  } from 'vuex';

  import {
    FILE_MUTATION_SET,
  } from 'src/data/file/types';

  export default {
    name: 'bible-chapter',
    components: {
      FilePrint,
    },
    methods: {
      ...mapMutations({
        setFileContent: FILE_MUTATION_SET,
      }),
    },
    async created() {
      const content = await axios.get(`static/bible/cmn-hans/${this.$route.params.book}/${this.$route.params.chapter}.json`);
      this.setFileContent({ file: content.data.lines });
    },
  };
</script>

<style>
.bible-chapter-container {
  overflow: auto;
}
</style>
