import LocalStorage from 'src/helpers/local-storage';

let myCjk = {};
if (LocalStorage.has('my-cjk')) {
  myCjk = LocalStorage.get('my-cjk');
}

let booksExhibitionType = '1';
if (LocalStorage.has('books-exhibition-type')) {
  booksExhibitionType = LocalStorage.get('books-exhibition-type');
}

let booksShowPinyin = 0;
if (LocalStorage.has('books-show-pinyin')) {
  booksShowPinyin = parseInt(LocalStorage.get('books-show-pinyin'), 10);
}

export default {
  files: [],
  file: [],
  fileSelecteds: {},
  fullFile: [],
  footnotes: [],
  fileLoading: false,
  fileParsing: false,
  fileImporting: false,
  fileChangeTimestamp: null,
  filePasteAction: '',
  myCjk,
  myCjkTemp: '',
  booksExhibitionType,
  booksShowPinyin,
};
