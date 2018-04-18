import * as types from './types';

export default {
  [types.VIDEO_GETTER_VIDEO_URL]({ videoUrl }) {
    return videoUrl;
  },
  [types.VIDEO_GETTER_FULL_FILE]({ fullFile }) {
    return fullFile;
  },
  [types.VIDEO_GETTER_SUBTITLE]({ subtitle }) {
    return subtitle;
  },
};
