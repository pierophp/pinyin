<template>
  <div>
    <menu-content>
      <template slot="click">
        <md-button class="md-icon-button">
          <md-icon>more_vert</md-icon>
        </md-button>
      </template>

      <div class="list-container">
        <div class="list-item" @click="downloadPleco()">
          <div class="icon">
            <md-icon>arrow_downward</md-icon>
          </div>
          <div class="content">{{ $t("download_pleco_dictionary") }}</div>
        </div>
      </div>
    </menu-content>
  </div>
</template>
<script>
import axios from 'axios';
import MenuContent from 'src/components/common/MenuContent';
const http = axios.create();
export default {
  components: {
    MenuContent,
  },
  methods: {
    async downloadPleco() {
      const fileName = 'Dicionario_Pleco.txt';
      const content = await http.get(`/${fileName}`);

      const blob = new Blob([content.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  },
};
</script>
