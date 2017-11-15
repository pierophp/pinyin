<template>
  <div>
      <md-menu md-size="medium" md-direction="top-start" :md-offset-y="-52">
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>more_vert</md-icon>
      </md-button>
      <md-menu-content>
        <md-menu-item @click.native="downloadPleco()">
          <md-icon>arrow_downward</md-icon>
          <span class="md-list-item-text">{{ $t('download_pleco_dictionary') }}</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>
<script>
import axios from 'axios';

const http = axios.create();
export default {
  methods: {
    async downloadPleco() {
      const fileName = 'Dicionario_Pleco.txt';
      const content = await http.get(`/${fileName}`);
      const blob = new Blob([content], { type: 'text/plain' });
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
