<template>
  <div>
    <md-button class="md-icon-button" @click.native="visualizationMode()">
      <md-icon>visibility</md-icon>
    </md-button>
  </div>
</template>
<script>
export default {
  methods: {
    visualizationMode() {
      this.$router.push({
        name: 'print',
        params: { filename: this.$route.params.filename },
      });
    },
  },
};
</script>
