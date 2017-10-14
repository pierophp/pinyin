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
      <md-list-item @click="goTo('/files')">
        <md-icon>insert_drive_file</md-icon> <span>{{ $t("menu.my_files") }}</span>
      </md-list-item>

      <md-list-item @click="goTo('/dictionary')">
        <md-icon>pageview</md-icon> <span>{{ $t("menu.dictionary") }}</span>
      </md-list-item>

      <md-list-item @click="goTo('/bible')">
        <md-icon>import_contacts</md-icon> <span>{{ $t("menu.bible") }}</span>
      </md-list-item>

      <md-list-item @click="goTo('/my-cjk')">
        <md-icon>translate</md-icon> <span>{{ $t("menu.my_ideograms") }}</span>
      </md-list-item>

      <md-list-item @click="goTo('/video')">
        <md-icon>play_circle_outline</md-icon> <span>{{ $t("menu.video") }}</span>
      </md-list-item>

      <md-list-item @click="goTo('/config')">
        <md-icon>settings</md-icon> <span>{{ $t("menu.settings") }}</span>
      </md-list-item>

      <md-list-item @click="logout()">
        <md-icon>power_settings_new</md-icon> <span>{{ $t("menu.logout") }}</span>
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
      };
    },
    methods: {
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
