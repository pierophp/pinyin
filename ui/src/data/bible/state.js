import LocalStorage from 'src/helpers/local-storage';

let booksExhibitionType = '1';
if (LocalStorage.has('books-exhibition-type')) {
  booksExhibitionType = LocalStorage.get('books-exhibition-type');
}

let booksShowPinyin = 0;
if (LocalStorage.has('books-show-pinyin')) {
  booksShowPinyin = parseInt(LocalStorage.get('books-show-pinyin'), 10);
}

let versesShowAsModal = 0;
if (LocalStorage.has('verses-show-as-modal')) {
  versesShowAsModal = parseInt(LocalStorage.get('verses-show-as-modal'), 10);
}

let openChapterOnLoad = 0;
if (LocalStorage.has('open-chapter-on-load')) {
  openChapterOnLoad = parseInt(LocalStorage.get('open-chapter-on-load'), 10);
}

export default {
  booksExhibitionType,
  booksShowPinyin,
  versesShowAsModal,
  versesModalVisible: false,
  openChapterOnLoad,
};
