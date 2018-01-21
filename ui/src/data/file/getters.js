import * as types from './types';

export default {
  [types.FILES_GETTER]({ files }) {
    return files;
  },
  [types.FILE_GETTER]({ file }) {
    return file;
  },
  [types.FILE_GETTER_LOADING]({ fileLoading }) {
    return fileLoading;
  },
  [types.FILE_GETTER_PARSING]({ fileParsing }) {
    return fileParsing;
  },
  [types.FILE_GETTER_IMPORTING]({ fileImporting }) {
    return fileImporting;
  },
  [types.FILE_GETTER_MY_CJK]({ myCjk }) {
    return myCjk;
  },
  [types.FILE_GETTER_MY_CJK_TEMP]({ myCjkTemp }) {
    return myCjkTemp;
  },
  [types.FILE_GETTER_FOOTNOTES]({ footnotes }) {
    return footnotes;
  },
  [types.FILE_GETTER_FULL_FILE]({ fullFile }) {
    return fullFile;
  },
  [types.FILE_GETTER_SELECTEDS]({ fileSelecteds }) {
    return fileSelecteds;
  },

};
