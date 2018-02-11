import * as types from './types';

export default {
  [types.VIDEO_MUTATION_SET_VIDEO_URL](state, videoUrl) {
    state.videoUrl = videoUrl;
  },
};
