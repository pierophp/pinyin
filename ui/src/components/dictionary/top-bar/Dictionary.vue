<template>
  <div>
    <v-menu offset-y>
      <v-btn icon slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile @click="downloadPleco()">
        <v-list-tile-action>
            <v-icon>arrow_downward</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('download_pleco_dictionary') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>
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
