<template>
  <div class="folders-container" v-if="dirs.length">
      <span v-for="(dir, index) in dirs" v-bind:key="index">
        <span v-if="index < dirs.length - 1 || showLast">
            <a href="javascript:void(0)" @click="goToDir(dir.path)">{{ dir.title }}</a> / 
        </span>
        <span v-if="index == dirs.length - 1 && !showLast">
            {{ dir.title }}
        </span>
      </span>
  </div>
</template>

<script>
export default {
  name: 'folder-structure',
  props: {
    showLast: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      dirs: [],
    };
  },
  watch: {
    $route() {
      this.updateDirs();
    },
  },
  created() {
    this.updateDirs();
  },
  methods: {
    goToDir(d) {
      this.$router.push({
        name: 'files',
        query: { d },
      });
    },
    updateDirs() {
      const dirs = [];

      if (this.$route.query.d) {
        let dirsList = this.$route.query.d.split('/');
        dirsList = dirsList.filter(item => item);

        let path = '';
        if (dirsList.length) {
          dirs.push({
            title: 'Home',
            path: '/',
          });
        }

        dirsList.forEach(item => {
          path += `/${item}`;
          dirs.push({
            title: item,
            path,
          });
        });
      }

      this.dirs = dirs;
    },
  },
};
</script>

<style>
.folders-container {
  padding: 10px 10px 10px;
}
</style>
