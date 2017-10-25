<template>
  <md-whiteframe md-tag="md-toolbar" md-elevation="2" md-theme="deep-purple" class="md-dense">
    <div class="md-toolbar-container">
      <md-button v-if="!hideTopBar && showMenu" class="md-icon-button" @click.native="$emit('toggle-sidebar')">
        <md-icon>menu</md-icon>
      </md-button>
      <h2 class="md-title" v-if="!hideTitle">{{ $t($router.options.appOptions.title) }}</h2>
      <span style="flex: 1" v-if="!hideTitle"></span>
      <dynamic :options="topBar"/>
    </div>
  </md-whiteframe>
</template>
<script>
  import Dynamic from 'src/components/layout/Dynamic';

  export default {
    components: {
      Dynamic,
    },
    props: {
      showMenu: true,
    },
    watch: {
      $route() {
        this.topBar = this.$route.meta.topBar;
        this.hideTopBar = this.$route.meta.hideTopBar;
        this.hideTitle = this.$route.meta.hideTitle;
      },
    },
    created() {
      document.title = this.$t(this.$router.options.appOptions.title);
    },
    data() {
      return {
        topBar: this.$route.meta.topBar,
        hideTopBar: this.$route.meta.hideTopBar,
        hideTitle: this.$route.meta.hideTitle,
      };
    },
  };
</script>
