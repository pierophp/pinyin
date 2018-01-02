import Vue from 'vue';
import http from 'src/helpers/http';
import clipboard01 from 'src/domain/clipboard-01';
import clipboard02 from 'src/domain/clipboard-02';
import clipboard03 from 'src/domain/clipboard-03';
import clipboard04 from 'src/domain/clipboard-04';
import LocalStorage from 'src/helpers/local-storage';
import replaceall from 'replaceall';
import { trimStart } from 'lodash';
import * as types from './types';

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

function loadFile(file, lineIndex, state, commit, storage, filename) {
  if (!state.fileLoading) {
    return;
  }

  if (file.length === lineIndex) {
    // Remove extra lines
    if (state.file.length > file.length) {
      state.file.splice(file.length, state.file.length - file.length);
    }

    commit(types.FILE_MUTATION_SET_FILE_LOADING, false);
    commit(types.FILE_MUTATION_SET_PINYIN_SPACED);

    if (storage) {
      http
        .get('files/file', {
          params: {
            filename: `${filename}.json`,
          },
        })
        .then(response => {
          commit(types.FILE_MUTATION_SET_FILE_LOADING, true);
          // state.fileLoading = true;
          const fileKey = `file_${filename}`;
          LocalStorage.save(fileKey, response.data.lines);
          commit(types.FILE_MUTATION_SET_FULL_FILE, response.data.lines);
          commit(types.FILE_MUTATION_SET_FILE_LOADING, response.data.lines);
          loadFile(
            LocalStorage.get(fileKey),
            0,
            state,
            commit,
            false,
            filename,
          );
        })
        .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
    }
    return;
  }

  const line = file[lineIndex];

  commit(types.FILE_MUTATION_SET_LINE, {
    line,
    lineIndex,
  });

  lineIndex += 1;
  if (storage) {
    Vue.nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          loadFile(file, lineIndex, state, commit, storage, filename);
        });
      });
    });
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loadFile(file, lineIndex, state, commit, storage, filename);
      });
    });
  }
}

export default {
  [types.FILE_ACTION_FETCH]({ commit, state }, filename) {
    const fileKey = `file_${filename}`;
    let lines = [];
    if (LocalStorage.has(fileKey)) {
      lines = LocalStorage.get(fileKey);
    }

    commit(types.FILE_MUTATION_SET_FULL_FILE, lines);
    commit(types.FILE_MUTATION_SET_FOOTNOTES, lines);
    commit(types.FILE_MUTATION_SET_FILE_LOADING, true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        commit(types.FILE_MUTATION_SET, { file: [] });
        loadFile(lines, 0, state, commit, true, filename);
      });
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

  [types.FILE_ACTION_SAVE]({ commit, state }, data) {
    if (state.fileChangeTimestamp === null) {
      return;
    }

    // Disable auto save on file is loading
    if (state.fileLoading) {
      return;
    }

    const fileKey = `file_${data.filename}`;

    (function actionSave() {
      const fileChangeTimestamp = state.fileChangeTimestamp;
      LocalStorage.save(fileKey, data.content);
      http
        .post(`files/save?filename=${data.filename}.json&type=file`, {
          content: JSON.stringify({ lines: data.content, hasSeparator: 0 }),
        })
        .then(() => {
          if (state.fileChangeTimestamp === fileChangeTimestamp) {
            state.fileChangeTimestamp = null;
          }
        })
        .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
    })();
  },

  [types.FILE_ACTION_CONVERT_TO_PINYIN]({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      const ideograms = [];
      state.file[data.lineIndex].forEach(block => {
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
  [types.FILE_ACTION_PARSE_PASTE]({ commit, state, dispatch }, data) {
    commit(types.FILE_MUTATION_SET_FILE_PARSING, true);

    let clipboardPromise;
    let convertToPinyin = false;

    if (data.action === '1') {
      clipboardPromise = clipboard01(data.content);
    }

    if (data.action === '2') {
      clipboardPromise = clipboard02(data.content);
    }

    if (data.action === '3') {
      clipboardPromise = clipboard03(data.content);
    }

    if (data.action === '4') {
      convertToPinyin = true;
      clipboardPromise = clipboard04(data.content);
    }

    const pinyinPromises = [];
    clipboardPromise.then(content => {
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
    });
  },

  async [types.FILE_ACTION_IMPORT_FILE]({ commit, state, dispatch }, data) {
    commit(types.FILE_MUTATION_SET_FILE_IMPORTING, true);
    const fileContent = await clipboard03(data.content);
    if (fileContent.files) {
      for (const file of fileContent.files) {
        state.fileChangeTimestamp = Date.now();
        await dispatch(types.FILE_ACTION_SAVE, {
          filename: `${data.filename}/${file.filename}`,
          content: file.content,
        });
      }
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

    const path = `${trimStart(dirname, '/')}${data.filename}`;

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

  [types.FILE_ACTION_FETCH_MY_CJK]({ commit }) {
    setTimeout(() => {
      http
        .get('my-cjk')
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

  [types.FILE_ACTION_JOIN_LEFT]({ commit, state, dispatch }, data) {
    const lineIndex = parseInt(data.lineIndex, 10);
    const blockIndex = parseInt(data.blockIndex, 10);
    const previousBlockIndex = blockIndex - 1;

    if (previousBlockIndex < 0) {
      return;
    }

    const character = `${state.file[lineIndex][previousBlockIndex].c}${
      state.file[lineIndex][blockIndex].c
    }`;
    const pinyin = `${state.file[lineIndex][previousBlockIndex].p}${
      state.file[lineIndex][blockIndex].p
    }`;

    commit(types.FILE_MUTATION_REMOVE_BLOCK, data);

    commit(types.FILE_MUTATION_UPDATE_CHARACTER, {
      lineIndex,
      blockIndex: previousBlockIndex,
      character,
    });

    commit(types.FILE_MUTATION_UPDATE_PINYIN, {
      lineIndex,
      blockIndex: previousBlockIndex,
      pinyin,
    });

    dispatch(types.FILE_ACTION_CONVERT_TO_PINYIN, { lineIndex });
  },

  [types.FILE_ACTION_SEPARATE]({ commit, state, dispatch }, data) {
    const separatedBlocks = data.separateCharacter
      .split(' ')
      .filter(character => character)
      .map(character => ({
        c: character,
        p: '',
      }));

    const lineIndex = parseInt(data.lineIndex, 10);
    const blockIndex = parseInt(data.blockIndex, 10);

    let blocks = state.file[lineIndex];
    const lastBlocks = blocks.splice(blockIndex, blocks.length - blockIndex);
    lastBlocks.shift();
    blocks = blocks.concat(separatedBlocks);
    blocks = blocks.concat(lastBlocks);

    commit(types.FILE_MUTATION_SET_LINE, {
      line: blocks,
      lineIndex,
    });

    dispatch(types.FILE_ACTION_CONVERT_TO_PINYIN, { lineIndex });
  },

  [types.FILE_ACTION_ADD_MY_CJK]({ commit }, data) {
    return http
      .post('my-cjk', {
        ideogram: data.myCjk,
      })
      .then(() => {
        commit(types.FILE_MUTATION_ADD_MY_CJK, data.myCjk);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_REMOVE_MY_CJK]({ commit }, data) {
    return http
      .delete('my-cjk', {
        data: {
          ideogram: data.myCjk,
        },
      })
      .then(() => {
        commit(types.FILE_MUTATION_REMOVE_MY_CJK, data.myCjk);
      })
      .catch(error => commit(types.FILE_MUTATION_FAILURE, error));
  },

  [types.FILE_ACTION_CAN_HIDE_PINYIN]({ state }, ideograms) {
    return state.myCjk[ideograms] !== undefined;
  },
};
