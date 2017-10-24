<template>
  <div class="video-parent-container" >
    <div class="video-container" v-show="!showSubtitle">
      <loadable-content :loading="loading">
        <md-input-container>
          <label for="size">{{ $t('show') }}</label>
          <md-select @change="refreshVideo" name="size" id="size" v-model="type">
            <md-option value="a">{{ $t('pinyin_ideograms') }}</md-option>
            <md-option value="p">{{ $t('pinyin_only') }}</md-option>
            <md-option value="c">{{ $t('ideograms_only') }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
            <md-icon>play_circle_outline</md-icon>
            <label>{{ $t("url") }}</label>
            <md-input @change="loadVideo" type="text" ref="inputSearch" v-model="videoUrl"></md-input>
        </md-input-container>
        <video :src="videoUrl" controls preload ref="video" v-show="videoUrl">
        </video>

        <br/><br/>
        <a :href="downloadLink" v-if="downloadLink" :download="downloadFilename">
          <md-button v-if="downloadLink" class="md-raised">{{ $t("download_track") }}</md-button>
        </a>
        <md-button v-if="downloadLink" class="md-raised md-primary" @click.native="toggleSubtitle">{{ $t("show_track") }}</md-button>
      </loadable-content>

      <md-snackbar md-position="bottom center" ref="snackbar" md-duration="3000">
        <span>{{ $t("message_no_track") }}</span>
      </md-snackbar>
    </div>

    <div class="editor-container" v-show="showSubtitle">
      <div>
        <md-button class="md-raised md-accent no-print" @click.native="toggleSubtitle">{{ $t("hide_track") }}</md-button>
      </div>
      <video-subtitle :url="videoUrl"/>
    </div>
  </div>
</template>

<script>
  import http from 'src/helpers/http';
  import LoadableContent from 'src/components/common/loading/LoadableContent';
  import webVTTParser from 'src/domain/webvtt-parser';
  import VideoSubtitle from 'src/components/video/Subtitle';

  export default {
    name: 'video-show',
    components: {
      LoadableContent,
      VideoSubtitle,
    },
    moounted() {
      setTimeout(() => {
        this.$refs.inputSearch.$el.focus();
      }, 500);
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
      loadVideo(videoUrl) {
        this.videoUrl = videoUrl;
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
        this.downloadFilename = urlParts[urlParts.length - 1].replace('.mp4', '.srt');

        http
          .get('jw/track', {
            params: {
              url: videoUrl,
              type: this.type,
            },
          })
          .then((response) => {
            const lines = response.data.split('\n');
            if (lines.length === 1) {
              this.$refs.snackbar.open();
              this.loading = false;
              video.play();
              return;
            }

            const tracks = webVTTParser(lines);
            let trackContent = '';
            let i = 0;
            tracks.forEach((trackItem) => {
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
            video.play();
          });
      },
    },
    data() {
      return {
        downloadLink: '',
        downloadFilename: '',
        videoUrl: '',
        track: '',
        type: 'a',
        loading: false,
        showSubtitle: false,
      };
    },
  };
</script>

<style>
  .video-parent-container{
    display: flex;
    flex: 1;
  }

  .editor-container{
    flex-flow: column nowrap;
    display: flex;
    flex: 1;
  }
  .video-container{
    padding: 0 10px;
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    overflow: hidden;
  }

  .video-scroll{
    flex: 1;
    will-change: transform;
    overflow: auto;
    padding: 0 10px;
  }

  .video-container .md-input-container{
    margin: 0;
  }

  /* TODO Review This Value on Full Screen*/
  /*::cue(ruby) {
    font-size:170%;
  } */

  ::cue(rt) {
    color: #ccc;
    background:#000;
  }
</style>
