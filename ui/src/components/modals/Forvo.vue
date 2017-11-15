<template>
  <md-dialog ref="dialogForvo" :md-active.sync="modalOpen">
    <md-dialog-content>
      <iframe :src="'https://pt.forvo.com/word/' + character + '#zh'" id="forvo"/>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click.native="close()">OK</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
  export default {
    name: 'modal-forvo',
    props: {
      character: '',
    },
    data() {
      return {
        modalOpen: false,
      };
    },
    methods: {
      open() {
        this.modalOpen = true;
      },
      close() {
        this.modalOpen = false;
      },
    },
  };
</script>
