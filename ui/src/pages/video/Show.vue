<template>
  <div class="video-parent-container" >
    <div class="video-container">
      <loadable-content :loading="loading">
        <div class="video-form" v-show="!showSubtitle || !isPhone" >
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
          <div  v-show="!showSubtitle || !isPhone" class="video-player">
            <video :src="videoUrlExhibition" controls preload ref="video" v-show="videoUrl">
            </video>

            <br/><br/>
            <a :href="downloadLink" v-if="downloadLink" :download="downloadFilename">
              <md-button v-if="downloadLink" class="md-raised">{{ $t("download_track") }}</md-button>
            </a>
            <md-button v-if="downloadLink && isPhone" class="md-raised md-primary" @click.native="toggleSubtitle">{{ $t("show_track") }}</md-button>
            <md-switch v-if="downloadLink" v-model="repeatPhrase" class="md-primary">Repetir Frase</md-switch>
            <div v-show="repeatPhrase">
              <md-button class="md-raised md-primary" @click.native="saveStartTime">Tempo Inicial</md-button>
              <md-button class="md-raised md-primary" @click.native="saveEndTime">Tempo Final</md-button>
              <md-button class="md-raised md-primary" @click.native="startRepeatPhrase">Iniciar</md-button>
              <md-button class="md-raised md-primary" @click.native="endRepeatPhrase">Terminar</md-button>
            </div>
          </div>

          <div class="editor-container" v-show="showSubtitle">
            <div v-if="isPhone">
              <md-button class="md-raised md-accent no-print" @click.native="toggleSubtitle">{{ $t("hide_track") }}</md-button>
            </div>
            <video-subtitle :url="videoUrl"/>
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

const md = new MobileDetect(window.navigator.userAgent);

export default {
  name: 'video-show',
  components: {
    LoadableContent,
    VideoSubtitle,
  },
  mounted() {
    setTimeout(() => {
      this.$refs.inputSearch.$el.focus();
    }, 500);

    if (this.videoUrl) {
      this.loadVideo(this.videoUrl);
    }
  },
  watch: {
    videoUrl() {
      this.loadVideo(this.videoUrl);
    },
    type() {
      this.refreshVideo();
    },
  },
  methods: {
    toggleSubtitle() {
      this.showSubtitle = !this.showSubtitle;
    },

    formatTime(str) {
      if (str.split(':').length === 2) {
        return `00:${str}`.replace('.', ',');
      }

      return str.replace('.', ',');
    },
    hmsToSecondsOnly(str) {
      const p = str.split(':');
      let s = 0;
      let m = 1;

      while (p.length > 0) {
        s += m * parseFloat(p.pop(), 10);
        m *= 60;
      }

      return s;
    },
    refreshVideo() {
      this.loadVideo(this.videoUrl);
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

      const video = this.$refs.video;
      this.repeatPhraseTimer = setInterval(() => {
        if (this.endTime) {
          if (video.currentTime > this.endTime) {
            this.endRepeatPhrase();
            setTimeout(() => {
              this.startRepeatPhrase();
            }, 2000);
          }
        }
      }, 500);

      video.currentTime = this.startTime;
      video.play();
    },

    endRepeatPhrase() {
      clearInterval(this.repeatPhraseTimer);
      this.repeatPhraseTimer = null;
      const video = this.$refs.video;
      video.pause();
    },
    loadVideo(videoUrl) {
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

      http
        .get('jw/track', {
          params: {
            url: videoUrl,
            type: this.type,
          },
        })
        .then(response => {
          this.videoUrlExhibition = response.data.url;
          const lines = response.data.track.split('\n');
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
          this.showSubtitle = !this.isPhone;
          video.play();
        });
    },
  },
  data() {
    return {
      downloadLink: '',
      downloadFilename: '',
      videoUrl:
        'https://download-a.akamaihd.net/files/media_video/d9/pk_CHS_026_r240P.mp4',
      videoUrlExhibition: '',
      track: '',
      type: 'a',
      loading: false,
      showSubtitle: false,
      isPhone: md.phone() !== null,
      repeatPhrase: false,
      startTime: 0,
      endTime: 0,
      repeatPhraseTimer: null,
      showSnackbar: false,
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
  max-width: 360px;
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
