<template>
  <md-sidenav @click="$refs.sidenav.close()" md-theme="blue" class="md-left" ref="sidenav" md-swipeable :md-swipe-distance="60">
    <md-toolbar class="md-account-header">
      <md-list class="md-transparent">
        <md-list-item>
          <div class="md-list-text-container">
            <span>{{user.name}}</span>
            <span>{{user.email}}</span>
          </div>

          <md-button class="md-icon-button md-list-action">
            <md-icon>arrow_drop_down</md-icon>
          </md-button>
        </md-list-item>
      </md-list>
    </md-toolbar>

    <md-list >
      <md-list-item @click="doAction(menuItem.action, menuItem.link)" v-for="(menuItem, menuItemId) in menu" v-bind:key="menuItemId">
        <md-icon>{{ menuItem.icon }}</md-icon> <span>{{ $t(menuItem.title) }}</span>
      </md-list-item>
    </md-list>
  </md-sidenav>
</template>

<script>
  import User from 'src/domain/user';

  export default {
    name: 'side-nav',
    data() {
      return {
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
        this.$refs.sidenav.close();
        this.$router.push(link);
      },
      logout() {
        User.logout();
      },
    },
  };
</script>

<style>
  .md-toolbar.md-account-header{
    min-height: 0;
  }

  .md-sidenav-content {
    background-color: #fff;
    color: rgba(0, 0, 0, .87);
  }
</style>
