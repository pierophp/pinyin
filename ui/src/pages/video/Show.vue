<template>
  <div :class="[orientation, parentClass, 'video-parent-container']">
    <div class="video-container">
      <loadable-content :loading="loading">
        <div class="video-form" v-show="!showSubtitle || !isPhone || orientation === 'landscape'" >
          <div class="video-form-container" >
            <md-field class="type-form-container">
              <label for="type">{{ $t('show') }}</label>
              <md-select name="type" id="type" v-model="type">
                <md-option value="a">{{ $t('pinyin_ideograms') }}</md-option>
                <md-option value="p">{{ $t('pinyin_only') }}</md-option>
                <md-option value="c">{{ $t('ideograms_only') }}</md-option>
              </md-select>
            </md-field>

            <md-field class="url-form-container">
                <md-icon>play_circle_outline</md-icon>
                <label>{{ $t("url") }}</label>
                <md-input type="text" ref="inputSearch" v-model="videoUrl"></md-input>
            </md-field>
          </div>
        </div>

        <div class="video-exibition-container">
          <div  v-show="!showSubtitle || !isPhone || orientation === 'landscape'" class="video-player">
            <video :src="videoUrlExhibition" controls preload ref="video" v-show="videoUrl">
            </video>

            <br/><br/>
            <a :href="downloadLink" v-if="downloadLink" :download="downloadFilename">
              <md-button v-if="downloadLink" class="md-raised">{{ $t("download_track") }}</md-button>
            </a>
            <md-button v-if="downloadLink && isPhone && orientation === 'portrait'" class="md-raised md-primary" @click.native="toggleSubtitle">{{ $t("show_track") }}</md-button>
            <md-switch v-if="downloadLink" v-model="repeatPhrase" class="md-primary">{{ $t("repeat_phrase") }}</md-switch>
            <div v-show="repeatPhrase">
              <md-button class="md-raised" @click.native="saveStartTime">
                {{ $t("start_time") }}
                <span v-if="startTime !== null"><br/>({{ secondsToHms(startTime) }})</span>
              </md-button>
              <md-button class="md-raised" @click.native="saveEndTime">
                {{ $t("end_time") }}
                <span v-if="endTime !== null"><br/>({{ secondsToHms(endTime) }})</span>
              </md-button>
              <md-button class="md-raised md-primary" 
                @click.native="startRepeatPhrase" 
                v-if="!repeating" 
                :disabled="startTime === null || endTime === null">
                {{ $t("start") }}
              </md-button>
              <md-button class="md-raised md-primary" @click.native="endRepeatPhrase(true)" v-if="repeating">{{ $t("end") }}</md-button>
            </div>
          </div>

          <div class="editor-container" v-show="showSubtitle">
            <div v-if="isPhone && orientation === 'portrait'">
              <md-button class="md-raised md-accent no-print" @click.native="toggleSubtitle">{{ $t("hide_track") }}</md-button>
            </div>
            <video-subtitle :url="videoUrl" @go-to-video-time="goToVideoTime"/>
          </div>
        </div>
      </loadable-content>
    </div>

    <md-snackbar md-position="center" ref="snackbar" :md-duration="3000" :md-active.sync="showSnackbar">
      <span>{{ $t("message_no_track") }}</span>
    </md-snackbar>
  </div>
</template>

<script>
import http from 'src/helpers/http';
import LoadableContent from 'src/components/common/loading/LoadableContent';
import webVTTParser from 'src/domain/webvtt-parser';
import VideoSubtitle from 'src/components/video/Subtitle';
import MobileDetect from 'mobile-detect';

import { mapGetters, mapMutations } from 'vuex';
import {
  VIDEO_GETTER_VIDEO_URL,
  VIDEO_MUTATION_SET_SUBTITLE,
} from 'src/data/video/types';

const md = new MobileDetect(window.navigator.userAgent);

export default {
  name: 'video-show',
  components: {
    LoadableContent,
    VideoSubtitle,
  },
  computed: {
    ...mapGetters({
      videoUrlVuex: VIDEO_GETTER_VIDEO_URL,
    }),
    parentClass() {
      return this.isPhone ? 'phone' : '';
    },
  },
  mounted() {
    setTimeout(() => {
      this.$refs.inputSearch.$el.focus();
    }, 500);

    this.setOrientation();
    window.addEventListener('resize', this.setOrientation);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setOrientation);
  },
  watch: {
    videoUrlVuex() {
      this.videoUrl = this.videoUrlVuex;
    },
    async videoUrl() {
      await this.loadVideo(this.videoUrl);
    },
    async type() {
      await this.refreshVideo();
    },
  },
  methods: {
    ...mapMutations({
      setSubtitle: VIDEO_MUTATION_SET_SUBTITLE,
    }),
    goToVideoTime(time) {
      const video = this.$refs.video;
      video.currentTime = this.hmsToSecondsOnly(time) - 0.05;
    },
    setOrientation() {
      const oldOrientation = this.orientation;
      this.orientation =
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      this.$nextTick(() => {
        if (oldOrientation !== this.orientation) {
          this.initialShowSubtitle();
        }
      });
    },

    toggleSubtitle() {
      this.showSubtitle = !this.showSubtitle;
    },

    formatTime(str) {
      if (str.split(':').length === 2) {
        return `00:${str}`.replace('.', ',');
      }

      return str.replace('.', ',');
    },
    secondsToHms(seconds) {
      const date = new Date(null);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
    },

    hmsToSecondsOnly(time) {
      const mili = time.split('.');
      let seconds = mili[0]
        .split(':')
        .reverse()
        .reduce((prev, curr, i) => prev + curr * 60 ** i, 0);

      if (mili[1]) {
        seconds = `${seconds}.${mili[1]}`;
      }

      return seconds;
    },
    async refreshVideo() {
      await this.loadVideo(this.videoUrl);
    },
    saveStartTime() {
      const video = this.$refs.video;
      this.startTime = video.currentTime;
    },
    saveEndTime() {
      const video = this.$refs.video;
      this.endTime = video.currentTime;
    },
    startRepeatPhrase() {
      if (this.repeatPhraseTimer) {
        return;
      }

      this.repeating = true;

      const video = this.$refs.video;
      this.repeatPhraseTimer = setInterval(() => {
        if (this.endTime) {
          if (video.currentTime > this.endTime) {
            this.endRepeatPhrase(false);
            setTimeout(() => {
              if (!this.repeating) {
                return;
              }
              this.startRepeatPhrase();
            }, 2000);
          }
        }
      }, 500);

      video.currentTime = this.startTime;
      video.play();
    },

    initialShowSubtitle() {
      this.showSubtitle = !this.isPhone || this.orientation === 'landscape';
    },

    endRepeatPhrase(cancelRepeating) {
      clearInterval(this.repeatPhraseTimer);
      this.repeatPhraseTimer = null;
      const video = this.$refs.video;
      video.pause();

      if (cancelRepeating) {
        this.repeating = false;
      }
    },
    async loadVideo(videoUrl) {
      this.videoUrlExhibition = '';
      this.repeating = false;
      this.startTime = null;
      this.endTime = null;
      if (this.repeatPhraseTimer) {
        clearInterval(this.repeatPhraseTimer);
        this.repeatPhraseTimer = null;
      }

      if (videoUrl.indexOf('.mp4') !== -1) {
        this.videoUrlExhibition = videoUrl;
      }

      if (!videoUrl) {
        return;
      }

      if (this.track) {
        this.track.mode = 'hidden';
      }

      this.loading = true;
      const video = this.$refs.video;
      const track = video.addTextTrack('subtitles');
      this.track = track;
      track.mode = 'showing';
      this.downloadLink = '';

      const urlParts = videoUrl.split('/');
      this.downloadFilename = urlParts[urlParts.length - 1].replace(
        '.mp4',
        '.srt',
      );

      const response = await http.get('jw/track', {
        params: {
          url: videoUrl,
          type: this.type,
        },
      });

      if (!this.videoUrlExhibition) {
        this.videoUrlExhibition = response.data.url;
      }

      const lines = response.data.track.split('\n');
      this.setSubtitle(lines);
      if (lines.length === 1) {
        this.showSnackbar = true;
        this.loading = false;
        video.play();
        return;
      }

      const tracks = webVTTParser(lines);
      let trackContent = '';
      let i = 0;
      tracks.forEach(trackItem => {
        i += 1;
        const message = trackItem.message.join('\n');
        trackContent += `${i}\n`;
        trackContent += `${this.formatTime(trackItem.startTime)} --> `;
        trackContent += `${this.formatTime(trackItem.endTime)}\n`;
        trackContent += `${message}\n\n`;
        const startTime = this.hmsToSecondsOnly(trackItem.startTime);
        const endTime = this.hmsToSecondsOnly(trackItem.endTime);
        const trackCue = new VTTCue(startTime, endTime, message);
        track.addCue(trackCue);
      });
      const blob = new Blob([trackContent], { type: 'text/plain' });
      this.downloadLink = window.URL.createObjectURL(blob);
      this.loading = false;
      this.initialShowSubtitle();
      video.play();
    },
  },
  data() {
    return {
      downloadLink: '',
      downloadFilename: '',
      videoUrl: '',
      videoUrlExhibition: '',
      track: '',
      type: 'a',
      loading: false,
      showSubtitle: false,
      isPhone: md.phone() !== null,
      repeatPhrase: false,
      startTime: null,
      endTime: null,
      repeating: false,
      repeatPhraseTimer: null,
      showSnackbar: false,
      orientation: '',
    };
  },
};
</script>

<style>
.video-parent-container {
  display: flex;
  flex: 1;
}

.loadable-content {
  display: flex;
  flex-direction: column;
}

.video-form-container {
  display: flex;
  padding: 0 10px;
}

.url-form-container {
  max-width: 600px;
}

.type-form-container {
  width: 150px;
  overflow: hidden;
  margin-right: 15px;
}

.video-exibition-container {
  display: flex;
  overflow: auto;
  flex-grow: 1;
}

.video-player {
  padding: 0 10px;
  width: 50vw;
  max-height: 50vh;
}

.phone.portrait .video-player {
  width: 100vw;
  max-width: 100vw;
}

.video-player video {
  width: 100%;
}
.editor-container {
  flex-flow: column nowrap;
  display: flex;
  flex: 1;
}

.video-container {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
}

.video-scroll {
  flex: 1;
  will-change: transform;
  overflow: auto;
  padding: 0 10px;
}

.video-container .md-input-container {
  margin: 0;
}

/* TODO Review This Value on Full Screen*/
/*::cue(ruby) {
    font-size:170%;
  } */

::cue(rt) {
  color: #ccc;
  background: #000;
}
</style>
