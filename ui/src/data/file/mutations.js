import Vue from 'vue';
import pinyin from 'src/helpers/pinyin';
import LocalStorage from 'src/helpers/local-storage';
import * as types from './types';
import separatePinyinInSyllables from '../../../../shared/helpers/separate-pinyin-in-syllables';


function addHighlight(state, data) {
  for (let i = parseInt(data.startLine, 10); i <= parseInt(data.endLine, 10); i += 1) {
    let startBlock = 0;
    let endBlock = state.file[i].length - 1;
    if (i === parseInt(data.startLine, 10)) {
      startBlock = data.startBlock;
    }

    if (i === parseInt(data.endLine, 10)) {
      endBlock = data.endBlock;
    }

    for (let j = parseInt(startBlock, 10); j <= parseInt(endBlock, 10); j += 1) {
      state.file[i][j].h = data.type;
    }
  }

  state.fileChangeTimestamp = Date.now();
  window.getSelection().removeAllRanges();
}

function findRange(state, data) {
  let startLine = parseInt(data.startLine, 10);
  let startBlock = parseInt(data.startBlock, 10);
  let endLine = parseInt(data.endtLine, 10);
  let endBlock = parseInt(data.endBlock, 10);
  const highlight = state.file[startLine][startBlock].h;

  function findRangeStart(line, block) {
    if (state.file[line][block].h !== highlight) {
      return;
    }

    startLine = line;
    startBlock = block;

    block -= 1;
    if (block < 0) {
      line -= 1;
      if (line < 0) {
        return;
      }

      block = state.file[line].length - 1;
    }

    findRangeStart(line, block);
  }

  findRangeStart(startLine, startBlock);

  function findRangeEnd(line, block) {
    if (state.file[line][block].h !== highlight) {
      return;
    }

    endLine = line;
    endBlock = block;

    block += 1;
    if (block === state.file[line].length) {
      line += 1;
      block = 0;
    }

    if (line === state.file.length) {
      return;
    }

    findRangeEnd(line, block);
  }

  findRangeEnd(startLine, startBlock);

  return [
    startLine,
    startBlock,
    endLine,
    endBlock,
  ];
}

export default {
  [types.FILE_MUTATION_SET](state, { file }) {
    file.forEach((line, lineIndex) => {
      line.forEach((block, blockIndex) => {
        if (block.h === undefined) {
          file[lineIndex][blockIndex].h = '';
        }

        if (block.p === undefined) {
          file[lineIndex][blockIndex].p = '';
        }

        if (block.c === undefined) {
          file[lineIndex][blockIndex].c = '';
        }
      });
    });

    state.file = file;
  },

  [types.FILE_MUTATION_SET_LINE](state, { line, lineIndex }) {
    line.forEach((block, blockIndex) => {
      if (block.h === undefined) {
        line[blockIndex].h = '';
      }

      if (block.p === undefined) {
        line[blockIndex].p = '';
      }

      if (block.c === undefined) {
        line[blockIndex].c = '';
      }

      if (state.fullFile && state.fullFile[0] &&
          (!state.fullFile[0][0].line || !state.fullFile[0][0].line.pinyinSpaced)) {
        const pinyinList = separatePinyinInSyllables(line[blockIndex].p);
        line[blockIndex].p = pinyinList.join(String.fromCharCode(160));
      }
    });

    Vue.set(state.file, lineIndex, line);
  },

  [types.FILE_MUTATION_SET_PINYIN_SPACED](state) {
    if (!state.fullFile) {
      return;
    }

    if (!state.fullFile[0]) {
      return;
    }

    if (!state.fullFile[0][0]) {
      return;
    }

    if (!state.fullFile[0][0].line) {
      return;
    }

    state.fullFile[0][0].line.pinyinSpaced = 1;
    state.file[0][0].line.pinyinSpaced = 1;
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILES_MUTATION_SET](state, files) {
    state.files = files;
  },

  [types.FILE_MUTATION_UPDATE_PINYIN](state, data) {
    const newPinyin = separatePinyinInSyllables(pinyin(data.pinyin)).join(String.fromCharCode(160));
    state.file[data.lineIndex][data.blockIndex].p = newPinyin;
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_UPDATE_CHARACTER](state, data) {
    state.file[data.lineIndex][data.blockIndex].c = data.character;
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_FAILURE](state, data) {
    // eslint-disable-next-line
    console.log(data);
  },

  [types.FILE_MUTATION_ADD_HIGHLIGHT](state, data) {
    let startLine = null;
    let startBlock = null;
    let endLine = null;
    let endBlock = null;
    if (state.file[data.startLine][data.startBlock].h) {
      [startLine, startBlock, endLine, endBlock] = findRange(state, data);
      data.startLine = startLine;
      data.startBlock = startBlock;
      data.endLine = endLine;
      data.endBlock = endBlock;
    }
    addHighlight(state, data);
  },

  [types.FILE_MUTATION_REMOVE_HIGHLIGHT](state, data) {
    let startLine = null;
    let startBlock = null;
    let endLine = null;
    let endBlock = null;

    [startLine, startBlock, endLine, endBlock] = findRange(state, data);

    addHighlight(state, {
      startLine,
      startBlock,
      endLine,
      endBlock,
      type: '',
    });
  },
  [types.FILE_MUTATION_ADD_EMPTY_LINE](state) {
    if (state.file === undefined) {
      state.file = [];
    }

    state.file.push([]);
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_CONCATENATE_LINE](state, data) {
    data.content.forEach((newBlock) => {
      state.file[data.lineIndex].push(newBlock);
    });
    state.fileChangeTimestamp = Date.now();
  },
  [types.FILE_MUTATION_ADD_LINE](state, data) {
    state.file.splice(data.lineIndex, 0, data.content);
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_ADD_EMPTY_BLOCK](state, data) {
    if (state.file[data.lineIndex] === null) {
      state.file[data.lineIndex] = [];
    }

    state.file[data.lineIndex].push({
      p: '',
      c: '',
    });
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_REMOVE_LINE](state, data) {
    state.file.remove(data.lineIndex);
    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_REMOVE_BLOCK](state, data) {
    const lineIndex = parseInt(data.lineIndex, 10);
    const blockIndex = parseInt(data.blockIndex, 10);
    const line = state.file[data.lineIndex].filter(
      (block, index) => index !== blockIndex);

    Vue.set(state.file, lineIndex, line);

    state.fileChangeTimestamp = Date.now();
  },

  [types.FILE_MUTATION_PASTE_ACTION](state, filePasteAction) {
    state.filePasteAction = filePasteAction;
  },

  [types.FILE_MUTATION_SET_MY_CJK](state, myCjk) {
    state.myCjk = myCjk;
  },

  [types.FILE_MUTATION_SET_MY_CJK_TEMP](state, myCjk) {
    state.myCjkTemp = myCjk;
  },

  [types.FILE_MUTATION_ADD_MY_CJK](state, myCjk) {
    Vue.set(state.myCjk, myCjk, true);
  },

  [types.FILE_MUTATION_REMOVE_MY_CJK](state, myCjk) {
    Vue.delete(state.myCjk, myCjk);
  },


  [types.FILE_MUTATION_SET_SELECTEDS](state, fileSelecteds) {
    state.fileSelecteds = fileSelecteds;
  },

  [types.FILE_MUTATION_SET_FILE_LOADING](state, fileLoading) {
    state.fileLoading = fileLoading;
  },

  [types.FILE_MUTATION_SET_FILE_PARSING](state, fileParsing) {
    state.fileParsing = fileParsing;
  },

  [types.FILE_MUTATION_SET_FILE_IMPORTING](state, fileImporting) {
    state.fileImporting = fileImporting;
  },

  [types.FILE_MUTATION_SET_FULL_FILE](state, fullFile) {
    state.fullFile = fullFile;
  },

  [types.FILE_MUTATION_SET_BOOKS_EXHIBITION_TYPE](state, booksExhibitionType) {
    LocalStorage.save('books-exhibition-type', booksExhibitionType);
    state.booksExhibitionType = booksExhibitionType;
  },

  [types.FILE_MUTATION_SET_BOOKS_SHOW_PINYIN](state, booksShowPinyin) {
    LocalStorage.save('books-show-pinyin', booksShowPinyin);
    state.booksShowPinyin = booksShowPinyin;
  },

  [types.FILE_MUTATION_SET_FOOTNOTES](state, lines) {
    const footnotes = [];
    lines.forEach((line, lineIndex) => {
      if (line[0] !== undefined && line[0].line !== undefined) {
        const type = line[0].line.type;
        if (type === 'foot') {
          footnotes.push(lineIndex);
        }
      }
    });

    state.footnotes = footnotes;
  },
};
