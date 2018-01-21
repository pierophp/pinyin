import LocalStorage from 'src/helpers/local-storage';
import * as types from './types';

export default {
  [types.BIBLE_MUTATION_SET_BOOKS_EXHIBITION_TYPE](state, booksExhibitionType) {
    LocalStorage.save('books-exhibition-type', booksExhibitionType);
    state.booksExhibitionType = booksExhibitionType;
  },

  [types.BIBLE_MUTATION_SET_BOOKS_SHOW_PINYIN](state, booksShowPinyin) {
    LocalStorage.save('books-show-pinyin', booksShowPinyin);
    state.booksShowPinyin = booksShowPinyin;
  },

  [types.BIBLE_MUTATION_SET_VERSES_SHOW_AS_MODAL](state, versesShowAsModal) {
    versesShowAsModal = versesShowAsModal ? 1 : 0;
    LocalStorage.save('verses-show-as-modal', versesShowAsModal);
    state.versesShowAsModal = versesShowAsModal;
  },

  [types.BIBLE_MUTATION_SET_VERSES_MODAL_VISIBLE](state, versesModalVisible) {
    state.versesModalVisible = versesModalVisible;
  },

  [types.BIBLE_MUTATION_SET_OPEN_CHAPTER_ON_LOAD](state, openChapterOnLoad) {
    openChapterOnLoad = openChapterOnLoad ? 1 : 0;
    LocalStorage.save('open-chapter-on-load', openChapterOnLoad);
    state.openChapterOnLoad = openChapterOnLoad;
  },
};
