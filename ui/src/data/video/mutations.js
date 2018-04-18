import * as types from './types';

export default {
  [types.VIDEO_MUTATION_SET_VIDEO_URL](state, videoUrl) {
    state.videoUrl = videoUrl;
  },
  [types.VIDEO_MUTATION_SET_FULL_FILE](state, fullFile) {
    state.fullFile = fullFile;
  },
  [types.VIDEO_MUTATION_SET_SUBTITLE](state, subtitle) {
    state.subtitle = subtitle;
  },
};
