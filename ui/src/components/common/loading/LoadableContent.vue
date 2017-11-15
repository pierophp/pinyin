<template>
  <div class="loadable-content">
    <div class="loadable-loader" v-show="loading">
      <md-progress-spinner class="md-accent" md-mode="indeterminate" :visible="loading"></md-progress-spinner>
    </div>

    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'loadable-content',

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.loadable-content {
  position: relative;
  min-height: 48px;
}
.loadable-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, .7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.md-spinner {
  position: fixed;
  top: 200px;
}

</style>
