<template>
  <div class="files-wrapper">
    <div class="files-container">
      <loadable-content :loading="loading">
        <md-list class="md-double-line">
          <md-list-item v-for="(file, fileId) in filesList" @click="openOptions(fileId, $event)" v-bind:key="fileId">
            <md-button class="md-icon-button list-icon">
              <md-icon class="md-primary">
                {{ file.type == 'file' ? 'collections' : 'folder' }}
              </md-icon>
            </md-button>

            <div class="md-list-text-container">
              {{ file.path }}
            </div>

            <md-menu md-size="4" :md-offset-x="menuX" ref="menu">
              <md-button md-menu-trigger class="md-icon-button md-list-action">
                <md-icon>more_vert</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item @click="openImportDialog(file.path)" v-if="file.type == 'file'">
                  <md-icon>cloud_upload</md-icon>
                  <span>{{ $t("import_site") }}</span>
                </md-menu-item>
                <md-menu-item @click="visualizationMode(file.path)" v-if="file.type == 'file'">
                  <md-icon>visibility</md-icon>
                  <span>{{ $t("visualization_mode") }}</span>
                </md-menu-item>
                <md-menu-item @click="goToFile(file.path)" v-if="file.type == 'file'">
                  <md-icon>edit</md-icon>
                  <span>{{ $t("edition_mode") }}</span>
                </md-menu-item>
                <md-menu-item @click="openDeleteDialog(file.path)">
                  <md-icon>delete</md-icon>
                  <span>{{ $t("delete") }}</span>
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </md-list-item>
        </md-list>
      </loadable-content>
    </div>
    <new-file-modal></new-file-modal>
    <delete-file-modal :filename="deleteFilename" ref="deleteModal"></delete-file-modal>
    <import-site-modal :filename="importFilename" ref="importModal"></import-site-modal>
  </div>
</template>

<script>
  import NewFileModal from 'src/components/modals/NewFile';
  import DeleteFileModal from 'src/components/modals/DeleteFile';
  import ImportSiteModal from 'src/components/modals/ImportSite';
  import LoadableContent from 'src/components/common/loading/LoadableContent';

  import {
    mapActions,
    mapGetters,
  } from 'vuex';

  import {
  FILES_ACTION_FETCH,
  FILES_GETTER,
  FILE_GETTER_IMPORTING,
  } from 'src/data/file/types';

  export default {
    name: 'files-list',

    components: {
      NewFileModal,
      DeleteFileModal,
      ImportSiteModal,
      LoadableContent,
    },

    computed: {
      filesList: function filesList() {
        if (!this.enableFiles) {
          return [];
        }

        return this.files;
      },

      ...mapGetters({
        files: FILES_GETTER,
        loading: FILE_GETTER_IMPORTING,
      }),
    },

    data() {
      return {
        enableFiles: false,
        redirect: true,
        deleteFilename: '',
        importFilename: '',
        menuX: 0,
      };
    },

    created() {
      this.fetch();
    },

    mounted() {
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.enableFiles = true;
          });
        });
      }, 200);
    },

    methods: {
      ...mapActions({
        fetch: FILES_ACTION_FETCH,
      }),
      goToFile(filename) {
        this.redirect = true;
        // setTimeout(() => {
        if (!this.redirect) {
          return;
        }

        this.$router.push({
          name: 'file',
          params: { filename },
        });
        // }, 200);
      },
      openOptions(fileId, e) {
        this.menuX = (window.innerWidth - (e.clientX + 100)) * -1;
        this.$nextTick(() => {
          this.$refs.menu[fileId].open();
        });

        // setTimeout(() => {
        //  this.redirect = false;
        // }, 100);
      },
      openDeleteDialog(file) {
        this.deleteFilename = file;
        this.$refs.deleteModal.openDialog();
      },
      openImportDialog(file) {
        this.importFilename = file;
        this.$refs.importModal.openDialog();
      },
      visualizationMode(filename) {
        this.$router.push({
          name: 'print',
          params: { filename },
        });
      },
    },
  };
</script>

<style>
.files-wrapper{
  flex: 1;
  overflow: auto;
}

.files-container{
  padding-bottom: 65px;
  will-change: transform;
}

.files-container .md-list-item .list-icon{
  padding: 0;
}
</style>
