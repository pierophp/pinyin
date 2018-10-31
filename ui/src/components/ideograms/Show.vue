<template>
    <div class="ideogram-show">
      <span v-for="(data, index) in printData"
            :class="[data.ideogramClass]"
            :style="{ color: data.toneColor }"
            v-bind:key="index">{{data.character}}</span>
    </div>
</template>

<script>
import ideogramsShow from 'src/helpers/ideograms.show';
export default {
  name: 'ideograms-show',
  data() {
    return {
      printData: [],
    };
  },
  props: {
    useSpaces: false,
    pinyin: '',
    character: '',
  },
  created() {
    this.updateRender();
  },
  methods: {
    updateRender() {
      this.printData = ideogramsShow(this);
    },
  },
};
</script>
<style>
.ideogram-show {
  display: inline-block;
}

.no-ideogram {
  width: auto !important;
}
</style>
