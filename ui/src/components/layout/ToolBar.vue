<template>
  <div>
    <v-navigation-drawer
      v-model="showNavigation"
      fixed
      temporary
      app
    >
      <v-list dense>

        <v-divider></v-divider>

        <v-list-tile  v-if="user">
          <v-list-tile-content>
            <v-list-tile-title>{{user.name}}</v-list-tile-title>
            <v-list-tile-sub-title>{{user.email}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile @click="doAction(menuItem.action, menuItem.link)" v-for="(menuItem, menuItemId) in menu" v-bind:key="menuItemId">
          <v-list-tile-action>
            <v-icon>{{ menuItem.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t(menuItem.title) }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile >

      </v-list>
    </v-navigation-drawer>
    
    <v-toolbar  color="indigo" dark >
      <v-toolbar-side-icon v-if="!hideTopBar && showMenu" @click.stop="showNavigation = !showNavigation"></v-toolbar-side-icon>
      <v-toolbar-title  v-if="!hideTitle">{{ $t($router.options.appOptions.title) }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <dynamic :options="topBar"/>
    </v-toolbar>
  </div>
</template>
<script>
import Dynamic from 'src/components/layout/Dynamic';
import User from 'src/domain/user';

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
      showNavigation: false,
      topBar: this.$route.meta.topBar,
      hideTopBar: this.$route.meta.hideTopBar,
      hideTitle: this.$route.meta.hideTitle,
      user: User.getUser(),
      menu: this.$router.options.appOptions.menu,
    };
  },
  methods: {
    doAction(action, param) {
      if (action === 'goTo') {
        this.goTo(param);
      } else if (action === 'logout') {
        this.logout();
      }
    },
    goTo(link) {
      this.showNavigation = false;
      this.$router.push(link);
    },
    logout() {
      User.logout();
    },
  },
};
</script>
<style>
.md-toolbar .md-title {
  margin-left: 0 !important;
}

.md-drawer {
  width: 240px !important;
}
</style>
