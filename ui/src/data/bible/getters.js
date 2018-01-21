import * as types from './types';

export default {
  [types.BIBLE_GETTER_BOOKS_EXHIBITION_TYPE]({ booksExhibitionType }) {
    return booksExhibitionType;
  },

  [types.BIBLE_GETTER_BOOKS_SHOW_PINIYN]({ booksShowPinyin }) {
    return booksShowPinyin;
  },

  [types.BIBLE_GETTER_VERSES_SHOW_AS_MODAL]({ versesShowAsModal }) {
    return versesShowAsModal;
  },

  [types.BIBLE_GETTER_VERSES_MODAL_VISIBLE]({ versesModalVisible }) {
    return versesModalVisible;
  },

  [types.BIBLE_GETTER_OPEN_CHAPTER_ON_LOAD]({ openChapterOnLoad }) {
    return openChapterOnLoad;
  },
};
