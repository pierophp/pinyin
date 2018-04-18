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
import separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';

import { mapGetters, mapMutations } from 'vuex';

import { FILE_MUTATION_SET } from 'src/data/file/types';
import {
  VIDEO_GETTER_SUBTITLE,
  VIDEO_MUTATION_SET_FULL_FILE,
} from 'src/data/video/types';

export default {
  name: 'video-subtitle',
  components: {
    FilePrint,
  },
  created() {
    this.loadTrack([]);
    this.setFileContent({ file: [] });
  },

  watch: {
    subtitle: {
      handler: function handler() {
        this.loadTrack(this.subtitle);
      },
    },
  },
  computed: {
    ...mapGetters({
      subtitle: VIDEO_GETTER_SUBTITLE,
    }),
  },

  methods: {
    ...mapMutations({
      setFileContent: FILE_MUTATION_SET,
      setVideoFullFile: VIDEO_MUTATION_SET_FULL_FILE,
    }),
    async loadTrack(subtitle) {
      this.setFileContent({ file: [] });
      this.setVideoFullFile([]);
      const tracks = webVTTParser(subtitle);
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
      this.setVideoFullFile(lines);
    },
  },
};
</script>
