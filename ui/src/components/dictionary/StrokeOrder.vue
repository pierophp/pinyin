<template>
  <div class="hanzi-container">
    <div id="hanzi-controls">
      <span v-for="(item, itemId) in items" v-bind:key="itemId" @click="changeIdeogram(itemId)" :class="item.classActive"></span>
    </div>

    <div id="hanzi-writer"></div>
    <md-button class="md-icon-button md-raised md-primary" @click.native="animate">
      <md-icon>play_arrow</md-icon>
    </md-button>
  </div>
</template>

<script>
import http from 'src/helpers/http';
import HanziWriter from 'hanzi-writer';

export default {
  name: 'dictionary-stroke-order',
  watch: {
    ideograms() {
      this.update();
    },
  },
  data() {
    return {
      items: [],
      hanziWriterCache: {},
    };
  },
  mounted() {
    this.writer = new HanziWriter('hanzi-writer', '', {
      charDataLoader: (char, onComplete) => {
        if (!char) {
          return;
        }

        if (!this.hanziWriterCache[char]) {
          http
            .get('hanzi-writer', {
              params: {
                ideogram: char,
              },
            })
            .then(response => {
              if (response.data.response) {
                onComplete(response.data.response);
                this.hanziWriterCache[char] = response.data.response;
              }
            });
        } else {
          onComplete(this.hanziWriterCache[char]);
        }
      },
      showOutline: true,
      showCharacter: true,
      width: 250,
      height: 250,
      padding: 0,
      strokeAnimationDuration: 300, // duration of each stroke in ms
      delayBetweenStrokes: 500, // delay between drawing subsequent strokes in ms
      strokeColor: '#555',
      highlightColor: '#AAF', // color used to highlight strokes as a hint during quizzing
      outlineColor: '#DDD',
      drawingColor: '#333', // color of the line drawn by the user during quizzing

      showHintAfterMisses: 3, // give a hint after this many subsequent mistakes during quizzing
      highlightOnComplete: true, // flash the character when the quiz is successfully completed
    });
    this.update();
  },
  methods: {
    animate() {
      this.writer.animateCharacter({
        onComplete: () => {},
      });
    },
    changeIdeogram(itemId) {
      this.items.forEach((item, i) => {
        this.items[i].classActive = '';
      });
      this.items[itemId].classActive = 'active';
      this.writer.setCharacter(this.items[itemId].ideogram);
    },
    update() {
      this.items = [];
      if (!this.ideograms) {
        return;
      }
      for (let i = 0; i < this.ideograms.length; i += 1) {
        if (i === 0) {
          this.writer.setCharacter(this.ideograms[i]);
        }
        const classActive = i === 0 ? 'active' : '';
        this.items.push({
          classActive,
          ideogram: this.ideograms[i],
        });
      }
    },
  },
  props: {
    ideograms: {},
  },
};
</script>

<style>
.hanzi-container {
  width: 250px;
  text-align: center;
  position: relative;
}

#hanzi-writer svg {
  min-height: 250px;
}

#hanzi-controls {
  top: 20px;
  left: 260px;
  position: absolute;
  width: 30px;
  height: 100px;
}

#hanzi-controls span {
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background: #007aff;
  display: block;
  margin-bottom: 22px;
  background: #000;
  opacity: 0.2;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
}

#hanzi-controls span.active {
  background: #007aff;
  opacity: 1;
}
</style>
