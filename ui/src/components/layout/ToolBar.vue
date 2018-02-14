<template>
  <div>
    <md-toolbar class="md-primary md-dense">
      <md-button v-if="!hideTopBar && showMenu" class="md-icon-button" @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>

      <span class="md-title" v-if="!hideTitle">{{ $t($router.options.appOptions.title) }}</span>

      <dynamic :options="topBar"/>
    </md-toolbar>

    <md-drawer :md-active.sync="showNavigation">
      <md-toolbar :md-elevation="1" v-if="user">
        <span class="md-title">{{user.name}}</span>
        <span>{{user.email}}</span>
      </md-toolbar>

      <md-list >
        <md-list-item @click="doAction(menuItem.action, menuItem.link)" v-for="(menuItem, menuItemId) in menu" v-bind:key="menuItemId">
          <md-icon>{{ menuItem.icon }}</md-icon>
          <span class="md-list-item-text">{{ $t(menuItem.title) }}</span>
        </md-list-item>
      </md-list>
    </md-drawer>
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
