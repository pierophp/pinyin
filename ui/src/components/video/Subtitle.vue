<template>
  <file-print 
    :askToReload="false" 
    :showHighlight="false"
    @go-to-video-time="(time) => $emit('go-to-video-time', time)"
  />
</template>

<script>
import http from 'src/helpers/http';
import webVTTParser from 'src/domain/webvtt-parser';
import replaceall from 'replaceall';
import FilePrint from 'src/pages/files/FilePrint';
import * as separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';

import { mapMutations } from 'vuex';

import { FILE_MUTATION_SET } from 'src/data/file/types';

export default {
  name: 'video-subtitle',
  components: {
    FilePrint,
  },
  created() {
    this.loadTrack();
    this.setFileContent({ file: [] });
  },
  props: {
    url: '',
  },
  watch: {
    url: {
      handler: function handler() {
        this.loadTrack();
      },
    },
  },
  methods: {
    ...mapMutations({
      setFileContent: FILE_MUTATION_SET,
    }),
    async loadTrack() {
      if (!this.url) {
        return;
      }

      this.setFileContent({ file: [] });

      const response = await http.get('jw/track', {
        params: {
          url: this.url,
          type: 'a',
        },
      });

      const tracks = webVTTParser(response.data.track.split('\n'));
      const lines = [];

      tracks.forEach(trackItem => {
        trackItem.message.forEach((message, messageIndex) => {
          let content = message;
          content = replaceall('<ruby>', '', content);
          content = replaceall('</ruby>', '', content);

          const line = [];
          content.split('</rt>').forEach(item => {
            const blockItem = item.split('<rt>');
            if (blockItem.length === 1) {
              return;
            }

            const block = {
              c: blockItem[0].trim(),
              p: separatePinyinInSyllables(blockItem[1].trim()).join(
                String.fromCharCode(160),
              ),
            };

            if (messageIndex === 0) {
              block.startTime = trackItem.startTime;
            }

            line.push(block);
          });

          lines.push(line);
        });
      });

      this.setFileContent({ file: lines });
    },
  },
};
</script>
