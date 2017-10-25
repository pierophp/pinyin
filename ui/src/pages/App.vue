<template>
  <div id="container">
    <tool-bar @toggle-sidebar="toggle()" :showMenu="showMenu"></tool-bar>

    <div class="content">
      <router-view />
    </div>

    <side-nav ref="sidenav" v-if="showMenu"></side-nav>

  </div>
</template>

<script>
  import ToolBar from 'src/components/layout/ToolBar';
  import SideNav from 'src/components/layout/SideNav';

  export default {
    name: 'app',
    components: {
      ToolBar,
      SideNav,
    },
    data() {
      return {
        showMenu: this.$router.options.showMenu,
      };
    },
    methods: {
      toggle() {
        this.$refs.sidenav.$refs.sidenav.toggle();
      },
    },
  };
</script>
