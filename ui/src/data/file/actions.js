import Vue from 'vue';
import http from 'src/helpers/http';
import clipboard01 from 'src/domain/clipboard-01';
import clipboard02 from 'src/domain/clipboard-02';
import clipboard03 from 'src/domain/clipboard-03';
import clipboard04 from 'src/domain/clipboard-04';
import clipboardUrl from 'src/domain/clipboard-url';
import LocalStorage from 'src/helpers/local-storage';
import replaceall from 'replaceall';
import trimStart from 'lodash/trimStart';
import * as types from './types';
import separatePinyinInSyllables from 'src/helpers/separate-pinyin-in-syllables';

function parseLines(lines) {
  if (!lines) {
    return [];
  }

  if (!Array.isArray(lines)) {
    return [];
  }

  const returnLines = [];

  for (const line of lines) {
    if (!line) {
      continue;
    }

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

      if (lines[0] && (!lines[0][0].line || !lines[0][0].line.pinyinSpaced)) {
        const pinyinList = separatePinyinInSyllables(line[blockIndex].p);
        line[blockIndex].p = pinyinList.join(String.fromCharCode(160));
      }
    });

    returnLines.push(line);
  }

  return returnLines;
}

function sortFiles(files) {
  files.sort((a, b) =>
    a.path.toLowerCase().localeCompare(b.path.toLowerCase()),
  );
}

function arrayObjectIndexOf(array, searchTerm, property) {
  for (let i = 0, len = array.length; i < len; i += 1) {
    if (array[i][property] === searchTerm) {
      return i;
    }
  }
  return -1;
}

function loadFile({
  file,
  lineIndex,
  state,
  commit,
  storage,
  filename,
  pageLineIndex,
  notFetch,
}) {
  if (!state.fileLoading) {
    return;
  }

  const currentPage = state.currentPage;
  const perPage = state.perPage;

  const start = perPage * currentPage - perPage;
  const limit = perPage * currentPage - 1;

  if (lineIndex < start) {
    lineIndex += 1;
    loadFile({
      file,
      lineIndex,
      state,
      commit,
      storage,
      filename,
      pageLineIndex,
      notFetch,
    });
    return;
  }

  if (lineIndex > limit && lineIndex < file.length) {
    lineIndex += 1;
    loadFile({
      file,
      lineIndex,
      state,
      commit,
      storage,
      filename,
      pageLineIndex,
      notFetch,
    });
    return;
  }

  if (lineIndex >= file.length) {
    // Remove extra lines
    if (state.file.length > file.length) {
      state.file.splice(file.length, state.file.length - file.length);
    }

    commit(types.FILE_MUTATION_SET_FILE_LOADING, false);
    commit(types.FILE_MUTATION_SET_PINYIN_SPACED);

    if (storage && !notFetch) {
      http
        .get('files/file', {
          params: {
            filename: `${filename}.json`,
          },
        })
        .then(response => {
          commit(types.FILE_MUTATION_SET_FILE_LOADING, true);

          const linesParsed = parseLines(response.data.lines);

          const fileKey = `file_${filename}`;
          LocalStorage.save(fileKey, linesParsed);
          commit(types.FILE_MUTATION_SET_FULL_FILE, linesParsed);
          commit(types.FILE_MUTATION_SET_FOOTNOTES, linesParsed);

          loadFile({
            file: LocalStorage.get(fileKey),
            lineIndex: 0,
            state,
            commit,
            storage: false,
            filename,
            pageLineIndex: 0,
          });
        })
        .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
    }
    return;
  }

  const line = file[lineIndex];
  if (line && line[0]) {
    line[0].lineIndex = lineIndex;
    commit(types.FILE_MUTATION_SET_LINE, {
      line,
      lineIndex: pageLineIndex,
    });

    pageLineIndex += 1;
  }

  lineIndex += 1;
  if (storage) {
    Vue.nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loadFile({
            file,
            lineIndex,
            state,
            commit,
            storage,
            filename,
            pageLineIndex,
            notFetch,
          });
        });
      });
    });
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loadFile({
          file,
          lineIndex,
          state,
          commit,
          storage,
          filename,
          pageLineIndex,
          notFetch,
        });
      });
    });
  }
}

export default {
  [types.FILE_ACTION_FETCH]({ commit, state }, filename) {
    const fileKey = `file_${filename}`;
    let lines = [];
    if (LocalStorage.has(fileKey)) {
      lines = parseLines(LocalStorage.get(fileKey));
    }

    commit(types.FILE_MUTATION_SET_FULL_FILE, lines);
    commit(types.FILE_MUTATION_SET_FOOTNOTES, lines);
    commit(types.FILE_MUTATION_SET_FILE_LOADING, true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        commit(types.FILE_MUTATION_SET, { file: [] });
        loadFile({
          file: lines,
          lineIndex: 0,
          state,
          commit,
          storage: true,
          filename,
          pageLineIndex: 0,
        });
      });
    });
  },

  [types.FILE_ACTION_CHANGE_PAGE]({ commit, state }, filename) {
    commit(types.FILE_MUTATION_SET_FILE_LOADING, true);
    commit(types.FILE_MUTATION_SET, { file: [] });

    loadFile({
      file: JSON.parse(JSON.stringify(state.fullFile)),
      lineIndex: 0,
      state,
      commit,
      storage: true,
      filename,
      pageLineIndex: 0,
      notFetch: true,
    });
  },

  [types.FILE_ACTION_CLEAR]({ commit }) {
    commit(types.FILE_MUTATION_SET_FILE_LOADING, false);
    commit(types.FILE_MUTATION_SET, { file: [] });
  },

  [types.FILES_ACTION_FETCH]({ commit }) {
    if (LocalStorage.has('files')) {
      const files = LocalStorage.get('files');
      commit(types.FILES_MUTATION_SET, files);
    }

    http
      .get('files')
      .then(response => {
        sortFiles(response.data);
        LocalStorage.save('files', response.data);
        commit(types.FILES_MUTATION_SET, response.data);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  async [types.FILE_ACTION_SAVE]({ commit, state }, data) {
    if (state.fileChangeTimestamp === null) {
      return;
    }

    // Disable auto save on file is loading
    if (state.fileLoading) {
      return;
    }

    let content = data.content ? data.content : state.fullFile;

    const fileKey = `file_${data.filename}`;

    async function actionSave() {
      const fileChangeTimestamp = state.fileChangeTimestamp;
      LocalStorage.save(fileKey, content);
      try {
        await http.post(`files/save?filename=${data.filename}.json&type=file`, {
          content: JSON.stringify({ lines: content, hasSeparator: 0 }),
        });

        if (state.fileChangeTimestamp === fileChangeTimestamp) {
          state.fileChangeTimestamp = null;
        }
      } catch (e) {
        commit(types.FILE_MUTATION_FAILURE, e);
      }
    }

    await actionSave();
  },

  [types.FILE_ACTION_CONVERT_TO_PINYIN]({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      const ideograms = [];
      state.fullFile[data.lineIndex].forEach(block => {
        ideograms.push(block.c);
      });

      http
        .post('unihan/to_pinyin', {
          ideograms,
        })
        .then(response => {
          response.data.forEach((item, blockIndex) => {
            commit(types.FILE_MUTATION_UPDATE_PINYIN, {
              lineIndex: data.lineIndex,
              blockIndex,
              pinyin: item.pinyin,
            });
          });
          resolve();
        })
        .catch(error => {
          commit(types.FILE_MUTATION_FAILURE, error);
          reject();
        });
    });
  },
  async [types.FILE_ACTION_PARSE_PASTE]({ commit, state, dispatch }, data) {
    await commit(types.FILE_MUTATION_SET_FILE_PARSING, true);

    let content;
    let convertToPinyin = false;

    if (data.action === '1') {
      content = await clipboard01(data.content);
    }

    if (data.action === '2') {
      content = await clipboard02(data.content);
    }

    if (data.action === '3') {
      content = await clipboard03(data.content);
    }

    if (data.action === '4') {
      convertToPinyin = true;
      content = await clipboard04(data.content);
    }

    const pinyinPromises = [];

    content.forEach((row, index) => {
      const lineIndex = state.filePasteAction.lineIndex + index;
      if (index === 0) {
        commit(types.FILE_MUTATION_CONCATENATE_LINE, {
          lineIndex,
          content: row,
        });
      } else {
        commit(types.FILE_MUTATION_ADD_LINE, {
          lineIndex,
          content: row,
        });
      }

      if (convertToPinyin) {
        pinyinPromises.push(
          dispatch(types.FILE_ACTION_CONVERT_TO_PINYIN, { lineIndex }),
        );
      }
    });

    if (convertToPinyin) {
      Promise.all(pinyinPromises).then(() => {
        commit(types.FILE_MUTATION_SET_FILE_PARSING, false);
      });
    } else {
      commit(types.FILE_MUTATION_SET_FILE_PARSING, false);
    }
  },

  async [types.FILE_ACTION_IMPORT_FILE]({ commit, state, dispatch }, data) {
    commit(types.FILE_MUTATION_SET_FILE_IMPORTING, true);
    const fileContent = await clipboardUrl(data.content);
    if (fileContent.files) {
      for (const file of fileContent.files) {
        state.fileChangeTimestamp = Date.now();

        await dispatch(types.FILE_ACTION_SAVE, {
          filename: `${data.filename}/${file.filename}`,
          content: file.rows,
        });
      }

      await dispatch(types.FILES_ACTION_FETCH);
    } else {
      state.fileChangeTimestamp = Date.now();
      await dispatch(types.FILE_ACTION_SAVE, {
        filename: data.filename,
        content: fileContent,
      });
    }
    commit(types.FILE_MUTATION_SET_FILE_IMPORTING, false);
  },

  [types.FILE_ACTION_NEW_FILE]({ commit, state }, data) {
    let filename = replaceall('/', '-', data.filename);
    const type = data.type;
    const dirname = data.dirname;
    if (type === 'file') {
      filename += '.json';
    }

    let path = '';
    if (trimStart(dirname, '/')) {
      path = `${trimStart(dirname, '/')}/`;
    }

    path += data.filename;

    http
      .post(`files/save?filename=${filename}&type=${type}&dirname=${dirname}`, {
        content: JSON.stringify({ lines: [] }),
      })
      .then(() => {
        state.files.push({
          dirname,
          filename: data.filename,
          path,
          type,
        });
        sortFiles(state.files);

        LocalStorage.save('files', state.files);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_DELETE_FILE]({ commit, state }, data) {
    const fileKey = `file_${data.filename}`;
    const type = data.type;
    const dirname = data.dirname;

    let filename = data.filename;
    if (type === 'file') {
      filename += '.json';
    }

    http
      .delete(`files?filename=${filename}&type=${type}&dirname=${dirname}`)
      .then(() => {
        LocalStorage.remove(fileKey);
        state.files.splice(
          arrayObjectIndexOf(state.files, data.filename, 'path'),
          1,
        );
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_FETCH_MY_CJK]({ commit }, data) {
    setTimeout(() => {
      http
        .post('my-cjk/get', data)
        .then(response => {
          const myCjkIdeograms = {};
          response.data.ideograms.forEach(item => {
            myCjkIdeograms[item.ideogram] = true;
          });

          LocalStorage.save('my-cjk', myCjkIdeograms);
          commit(types.FILE_MUTATION_SET_MY_CJK, myCjkIdeograms);
        })
        .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
    }, 5000);
  },

  async [types.FILE_ACTION_JOIN_LEFT]({ commit, state, dispatch }, data) {
    const lineIndex = parseInt(data.lineIndex, 10);
    const blockIndex = parseInt(data.blockIndex, 10);
    const previousBlockIndex = blockIndex - 1;

    if (previousBlockIndex < 0) {
      return;
    }

    const character = `${state.fullFile[lineIndex][previousBlockIndex].c}${
      state.fullFile[lineIndex][blockIndex].c
    }`;

    const pinyin = `${state.fullFile[lineIndex][previousBlockIndex].p}${
      state.fullFile[lineIndex][blockIndex].p
    }`;

    await commit(types.FILE_MUTATION_REMOVE_BLOCK, data);

    await commit(types.FILE_MUTATION_UPDATE_CHARACTER, {
      lineIndex,
      blockIndex: previousBlockIndex,
      character,
    });

    await commit(types.FILE_MUTATION_UPDATE_PINYIN, {
      lineIndex,
      blockIndex: previousBlockIndex,
      pinyin,
    });

    await dispatch(types.FILE_ACTION_CONVERT_TO_PINYIN, { lineIndex });
  },

  async [types.FILE_ACTION_SEPARATE]({ commit, state, dispatch }, data) {
    const separatedBlocks = data.separateCharacter
      .split(' ')
      .filter(character => character)
      .map(character => ({
        c: character,
        p: '',
      }));

    const lineIndex = parseInt(data.lineIndex, 10);

    const blockIndex = parseInt(data.blockIndex, 10);

    let blocks = state.fullFile[lineIndex];
    const lastBlocks = blocks.splice(blockIndex, blocks.length - blockIndex);
    lastBlocks.shift();
    blocks = blocks.concat(separatedBlocks);
    blocks = blocks.concat(lastBlocks);

    await commit(types.FILE_MUTATION_SET_LINE_AND_SAVE, {
      line: blocks,
      lineIndex,
    });

    await dispatch(types.FILE_ACTION_CONVERT_TO_PINYIN, { lineIndex });
  },

  [types.FILE_ACTION_ADD_MY_CJK]({ commit, state }, data) {
    return http
      .post('my-cjk', {
        ideogram: data.myCjk,
        type: data.type,
        source: data.source,
      })
      .then(() => {
        commit(types.FILE_MUTATION_ADD_MY_CJK, data.myCjk);
        LocalStorage.save('my-cjk', state.myCjk);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_REMOVE_MY_CJK]({ commit, state }, data) {
    return http
      .delete('my-cjk', {
        data: {
          ideogram: data.myCjk,
          type: data.type,
          source: data.source,
        },
      })
      .then(() => {
        commit(types.FILE_MUTATION_REMOVE_MY_CJK, data.myCjk);
        LocalStorage.save('my-cjk', state.myCjk);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_CAN_HIDE_PINYIN]({ state }, ideograms) {
    return state.myCjk[ideograms] !== undefined;
  },
};
