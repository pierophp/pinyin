<template>
  <div class="hanzi-container">
    <div id="hanzi-controls">
      <span v-for="(item, itemId) in items" v-bind:key="itemId" @click="changeIdeogram(itemId)" :class="item.classActive"></span>
    </div>

    <div id="hanzi-writer" v-show="!partial"></div>

    <div id="partial-hanzi-writer" v-show="partial"></div>

    <md-button class="md-icon-button md-dense md-raised md-primary" @click.native="previous">
      <md-icon>chevron_left</md-icon>
    </md-button>

    <md-button class="md-icon-button md-dense md-raised md-primary" @click.native="animate">
      <md-icon>play_arrow</md-icon>
    </md-button>

    <md-button class="md-icon-button md-dense md-raised md-primary" @click.native="next">
      <md-icon>chevron_right</md-icon>
    </md-button>
  </div>
</template>
<script>
import axios from 'axios';
import HanziWriter from 'hanzi-writer';

function renderFanningStrokes(target, strokes) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '230px';
  svg.style.height = '230px';
  svg.style.border = '1px solid #EEE';
  svg.style.marginRight = '3px';

  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }

  target.appendChild(svg);

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const transformData = HanziWriter.getScalingTransform(230, 230);

  group.setAttributeNS(null, 'transform', transformData.transform);

  svg.appendChild(group);

  strokes.forEach(function(strokePath) {
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', strokePath);

    path.style.fill = '#555';
    group.appendChild(path);
  });
}

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
      partial: false,
      currentStroke: 0,
      charData: {},
      hanziWriterCache: {},
    };
  },
  mounted() {
    this.writer = new HanziWriter('hanzi-writer', '', {
      onLoadCharDataSuccess: charData => {
        this.charData = charData;
      },
      // this method doesn't work async
      charDataLoader: (char, onComplete) => {
        if (!char) {
          return;
        }

        this.loadIdeogram(char).then(response => onComplete(response));
      },
      showOutline: true,
      showCharacter: true,
      width: 230,
      height: 230,
      padding: 0,
      strokeAnimationDuration: 300, // duration of each stroke in ms
      delayBetweenStrokes: 300, // delay between drawing subsequent strokes in ms
      strokeFadeDuration: 400,
      delayBetweenStrokes: 200,
      strokeColor: '#555',
      radicalColor: '#143dd9',
      highlightColor: '#AAF', // color used to highlight strokes as a hint during quizzing
      outlineColor: '#DDD',
      drawingColor: '#333', // color of the line drawn by the user during quizzing
      showHintAfterMisses: 3, // give a hint after this many subsequent mistakes during quizzing
      highlightOnComplete: true, // flash the character when the quiz is successfully completed
      leniency: 1,
    });
    this.update();
  },
  methods: {
    animate() {
      this.currentStroke = 0;
      this.partial = false;
      this.writer.animateCharacter({
        onComplete: () => {},
      });
    },
    previous() {
      const target = document.getElementById('partial-hanzi-writer');

      this.currentStroke -= 1;
      if (this.currentStroke < 0) {
        this.currentStroke = 0;
      }

      const strokesPortion = this.charData.strokes.slice(0, this.currentStroke);

      this.partial = true;

      renderFanningStrokes(target, strokesPortion);
    },
    next() {
      const target = document.getElementById('partial-hanzi-writer');

      this.currentStroke += 1;
      if (this.currentStroke > this.charData.strokes.length) {
        this.currentStroke = this.charData.strokes.length;
      }

      const strokesPortion = this.charData.strokes.slice(0, this.currentStroke);

      renderFanningStrokes(target, strokesPortion);

      this.partial = true;
    },
    changeIdeogram(itemId) {
      this.items.forEach((item, i) => {
        this.items[i].classActive = '';
      });
      this.items[itemId].classActive = 'active';
      this.currentStroke = 0;
      this.partial = false;
      this.writer.setCharacter(this.items[itemId].ideogram);
    },
    async loadIdeogram(char) {
      if (this.hanziWriterCache[char]) {
        return this.hanziWriterCache[char];
      }

      this.hanziWriterCache[char] = (await axios.get(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`,
      )).data;

      return this.hanziWriterCache[char];
    },
    update() {
      this.items = [];
      if (!this.ideograms) {
        return;
      }

      const loadedIdeograms = {};

      for (let i = 0; i < this.ideograms.length; i += 1) {
        if (loadedIdeograms[this.ideograms[i]]) {
          continue;
        }

        this.items.push({
          classActive: '',
          ideogram: this.ideograms[i],
        });

        loadedIdeograms[this.ideograms[i]] = true;

        this.loadIdeogram(this.ideograms[i]).then();

        if (i === 0) {
          this.changeIdeogram(i);
        }
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
  width: 230px;
  text-align: center;
  position: relative;
}

#partial-hanzi-writer,
#partial-hanzi-writer svg,
#hanzi-writer,
#hanzi-writer svg {
  min-height: 230px;
}

#hanzi-controls {
  top: 20px;
  left: 225px;
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
