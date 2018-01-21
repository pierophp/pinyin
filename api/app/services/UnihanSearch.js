const Promise = require('bluebird');
const _ = require('lodash');
const nodejieba = require('nodejieba');
const replaceall = require('replaceall');
const knex = require('./knex');
const separatePinyinInSyllables = require('../../../shared/helpers/separate-pinyin-in-syllables');
const isChinese = require('../../../shared/helpers/is-chinese');
const { ArrayCache } = require('../cache/array.cache');
const { RedisCache } = require('../cache/redis.cache');

const ChineseToolsDownloader = require('../services/ChineseToolsDownloader');
const GlosbeDownloader = require('../services/GlosbeDownloader');
const fs = Promise.promisifyAll(require('fs'));
const { IdeogramsConverter } = require('../core/converter/ideograms.converter');
const { CjkRepository } = require('../repository/cjk.repository');

nodejieba.load({
  userDict: `${__dirname}/../data/compiled.utf8`,
});

const ideogramsConverter = new IdeogramsConverter();

module.exports = class UnihanSearch {
  static getChangeToneRules() {
    return {
      不: {
        4: 'bú',
      },
      一: {
        1: 'yì',
        2: 'yì',
        3: 'yì',
        4: 'yí',
      },
    };
  }

  static async searchToDictionaryList(search) {
    search = replaceall(' ', '', search);
    let cjkList = [];

    if (isChinese(search)) {
      const simplifiedIdeogram = await ideogramsConverter.traditionalToSimplified(
        search,
      );

      cjkList = await knex('cjk')
        .where({
          ideogram: UnihanSearch.convertIdeogramsToUtf16(simplifiedIdeogram),
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation', 'ideogram');

      const cjkListLike = await knex('cjk')
        .where(
          'ideogram',
          'LIKE',
          `${UnihanSearch.convertIdeogramsToUtf16(simplifiedIdeogram)}%`,
        )
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .orderBy('ideogram_length', 'ASC')
        .limit(100)
        .select(
          knex.raw(
            'id, pronunciation, ideogram, LENGTH(ideogram) ideogram_length',
          ),
        );

      cjkList = _.uniqBy([].concat(cjkList, cjkListLike), 'id');
    } else {
      cjkList = await knex('cjk')
        .where({
          pronunciation_unaccented: search,
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation', 'ideogram');

      const cjkListLike = await knex('cjk')
        .where('pronunciation_unaccented', 'LIKE', `${search}%`)
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .orderBy('ideogram_length', 'ASC')
        .limit(100)
        .select(
          knex.raw(
            'id, pronunciation, ideogram, LENGTH(ideogram) ideogram_length',
          ),
        );

      cjkList = _.uniqBy([].concat(cjkList, cjkListLike), 'id');
    }

    await Promise.mapSeries(cjkList, async entry => {
      entry.ideogram = UnihanSearch.convertUtf16ToIdeograms(entry.ideogram);
      entry.ideogramTraditional = await ideogramsConverter.simplifiedToTraditional(
        entry.ideogram,
      );
      return entry;
    });

    return { search, entries: cjkList };
  }

  static async searchToDictionary(search) {
    let where = {};
    if (search.ideograms !== undefined) {
      const simplifiedIdeogram = await ideogramsConverter.traditionalToSimplified(
        search.ideograms,
      );
      where.ideogram = UnihanSearch.convertIdeogramsToUtf16(simplifiedIdeogram);
    }

    if (search.pinyin !== undefined) {
      where.pronunciation = search.pinyin;
    }

    if (search.id !== undefined) {
      where.id = search.id;
    }

    let cjkList = await knex('cjk')
      .where(where)
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select(
        'id',
        'ideogram',
        'pronunciation',
        'definition_unihan',
        'definition_pt',
        'definition_cedict',
        'definition_ct_pt',
        'definition_ct_es',
        'definition_ct_en',
        'definition_glosbe_pt',
        'definition_glosbe_es',
        'definition_glosbe_en',
        'hsk',
      );

    if (cjkList.length === 0 && search.pinyin && search.ideograms) {
      where = {};
      const simplifiedIdeogram = await ideogramsConverter.traditionalToSimplified(
        search.ideograms,
      );
      where.ideogram = UnihanSearch.convertIdeogramsToUtf16(simplifiedIdeogram);
      cjkList = await knex('cjk')
        .where(where)
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select(
          'id',
          'ideogram',
          'pronunciation',
          'definition_unihan',
          'definition_pt',
          'definition_cedict',
          'definition_ct_pt',
          'definition_ct_es',
          'definition_ct_en',
          'definition_glosbe_pt',
          'definition_glosbe_es',
          'definition_glosbe_en',
          'hsk',
        );
    }

    const response = {};
    response.ideograms = search.ideograms;
    if (search.ideograms) {
      response.ideogramsTraditional = await ideogramsConverter.simplifiedToTraditional(
        search.ideograms,
      );
    }
    response.pronunciation = null;
    response.unihan = null;
    response.pt = null;
    response.cedict = null;
    response.chinese_tools_pt = null;
    response.chinese_tools_es = null;
    response.chinese_tools_en = null;
    response.glosbe_pt = null;
    response.glosbe_es = null;
    response.glosbe_en = null;

    let chineseToolsPt = null;
    let chineseToolsEs = null;
    let chineseToolsEn = null;

    let glosbePt = null;
    let glosbeEs = null;
    let glosbeEn = null;

    await Promise.map(cjkList, async cjk => {
      const ideograms = UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram);
      response.pronunciation = cjk.pronunciation;
      response.ideograms = ideograms;
      response.hsk = cjk.hsk;

      if (!response.ideogramsTraditional) {
        response.ideogramsTraditional = await ideogramsConverter.simplifiedToTraditional(
          ideograms,
        );
      }

      if (cjk.definition_unihan) {
        response.unihan = [cjk.definition_unihan];
      }

      if (cjk.definition_pt) {
        response.pt = JSON.parse(cjk.definition_pt);
      }

      if (cjk.definition_cedict) {
        if (!response.cedict) {
          response.cedict = JSON.parse(cjk.definition_cedict);
        } else {
          JSON.parse(cjk.definition_cedict).forEach(item => {
            response.cedict.push(item);
          });
        }
      }

      if (cjk.definition_ct_pt) {
        response.chinese_tools_pt = JSON.parse(cjk.definition_ct_pt);
      }

      if (cjk.definition_ct_es) {
        response.chinese_tools_es = JSON.parse(cjk.definition_ct_es);
      }

      if (cjk.definition_ct_en) {
        response.chinese_tools_en = JSON.parse(cjk.definition_ct_en);
      }

      if (cjk.definition_glosbe_pt) {
        response.glosbe_pt = JSON.parse(cjk.definition_glosbe_pt);
      }

      if (cjk.definition_glosbe_es) {
        response.glosbe_es = JSON.parse(cjk.definition_glosbe_es);
      }

      if (cjk.definition_glosbe_en) {
        response.glosbe_en = JSON.parse(cjk.definition_glosbe_en);
      }

      try {
        if (
          !cjk.definition_ct_pt &&
          !cjk.definition_ct_es &&
          !cjk.definition_ct_en
        ) {
          [chineseToolsPt, chineseToolsEs, chineseToolsEn] = await Promise.all([
            ChineseToolsDownloader.download(ideograms, 'pt'),
            ChineseToolsDownloader.download(ideograms, 'es'),
            ChineseToolsDownloader.download(ideograms, 'en'),
          ]);

          if (chineseToolsPt) {
            response.chinese_tools_pt = chineseToolsPt.split('\n');
          }

          if (chineseToolsEs) {
            response.chinese_tools_es = chineseToolsEs.split('\n');
          }

          if (chineseToolsEn) {
            response.chinese_tools_en = chineseToolsEn.split('\n');
          }

          CjkRepository.save({
            id: cjk.id,
            definition_ct_pt: JSON.stringify(response.chinese_tools_pt),
            definition_ct_es: JSON.stringify(response.chinese_tools_es),
            definition_ct_en: JSON.stringify(response.chinese_tools_en),
          }).then();
        }
      } catch (e) {
        // eslint-disable-next-line
        console.log('Chinese Tools Error: ' + e.message);
      }

      try {
        if (
          !cjk.definition_glosbe_pt &&
          !cjk.definition_glosbe_es &&
          !cjk.definition_glosbe_en
        ) {
          [glosbePt, glosbeEs, glosbeEn] = await Promise.all([
            GlosbeDownloader.download(ideograms, 'por'),
            GlosbeDownloader.download(ideograms, 'spa'),
            GlosbeDownloader.download(ideograms, 'eng'),
          ]);

          if (glosbePt) {
            response.glosbe_pt = glosbePt;
          }

          if (glosbeEs) {
            response.glosbe_es = glosbeEs;
          }

          if (glosbeEn) {
            response.glosbe_en = glosbeEn;
          }

          CjkRepository.save({
            id: cjk.id,
            definition_glosbe_pt: JSON.stringify(response.glosbe_pt),
            definition_glosbe_es: JSON.stringify(response.glosbe_es),
            definition_glosbe_en: JSON.stringify(response.glosbe_en),
          }).then();
        }
      } catch (e) {
        // eslint-disable-next-line
        console.log('Glosbe Error: ' + e.message);
      }
    });

    return response;
  }

  static searchByIdeograms(ideograms) {
    const ideogramPromises = [];

    for (let i = 0; i < ideograms.length; i += 1) {
      const ideogramConverted = ideograms[i].charCodeAt(0).toString(16);

      ideogramPromises.push(
        knex('cjk')
          .where({
            ideogram: ideogramConverted,
            type: 'C',
          })
          .orderBy('frequency', 'ASC')
          .orderBy('usage', 'DESC')
          .select('id', 'pronunciation'),
      );
    }

    return Promise.all(ideogramPromises);
  }

  static convertIdeogramsToUtf16(ideograms) {
    const ideogramsConverted = [];
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted.push(ideograms[i].charCodeAt(0).toString(16));
    }

    return ideogramsConverted.join('|');
  }

  static convertUtf16ToIdeograms(ideogramsUtf16) {
    const ideograms = ideogramsUtf16.split('|');
    let ideogramsConverted = '';
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted += String.fromCodePoint(parseInt(ideograms[i], 16));
    }

    return ideogramsConverted;
  }

  static async searchByWord(ideograms) {
    const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(ideograms);
    const cacheKey = `PINYIN_${ideogramConverted}`;

    if (await ArrayCache.has(cacheKey)) {
      return await ArrayCache.get(cacheKey);
    }

    let response = await RedisCache.get(cacheKey);

    await RedisCache.forget(cacheKey);

    if (response && response !== true) {
      await ArrayCache.set(cacheKey, response);
      return response;
    }

    let cacheResponse = '';

    if (ideograms.length === 1) {
      response = await knex('cjk')
        .where({
          ideogram: ideogramConverted,
          type: 'C',
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation');

      if (response.length > 0) {
        cacheResponse = response[0].pronunciation;
      }
    } else {
      response = await knex('cjk')
        .where({
          ideogram: ideogramConverted,
          type: 'W',
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation');
      if (response.length > 0) {
        cacheResponse = response[0].pronunciation;
      }
    }
    await ArrayCache.set(cacheKey, cacheResponse);
    await RedisCache.set(cacheKey, cacheResponse, 60 * 60 * 12); // 1 day

    return cacheResponse;
  }

  static extractPinyinTone(pinyin) {
    const tones = [
      {
        tone: 1,
        letters: ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'],
      },
      {
        tone: 2,
        letters: ['á', 'é', 'í', 'ó', 'ú', 'ǘ'],
      },
      {
        tone: 3,
        letters: ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'],
      },
      {
        tone: 4,
        letters: ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'],
      },
    ];

    for (const tone of tones) {
      for (const letter of tone.letters) {
        if (pinyin.indexOf(letter) > -1) {
          return tone.tone;
        }
      }
    }

    return 0;
  }
  static segment(text) {
    return nodejieba.cut(text).filter(item => {
      item = replaceall(String.fromCharCode(160), '', item); // Convert NO-BREAK SPACE to SPACE
      item = replaceall(String.fromCharCode(8201), '', item); // Convert THIN SPACE to SPACE
      item = replaceall(String.fromCharCode(8203), '', item); // Zero Width Space

      return item.trim();
    });
  }

  static parseResultByIdeograms(ideogramsList, ideograms, nextWord, options) {
    const specialsChars = {
      '。': ' ',
      '？': ' ',
      '?': ' ',
      '．': ' ',
      '、': ' ',
      '，': ' ',
      ',': ' ',
      '：': ' ',
      ':': ' ',
      ' ': ' ',
      '；': ' ',
      ';': ' ',
      '（': ' ',
      '）': ' ',
      '！': ' ',
      '《': ' ',
      '》': ' ',
      '“': ' ',
      '”': ' ',
      '-': ' ',
      '…': ' ',
      '—': ' ',
      '^': ' ',
      '’': ' ',
      '‘': ' ',
      '─': ' ',
      '.': ' ',
      '!': ' ',
      '/': ' ',
      '［': ' ',
      '］': ' ',
      '·': ' ',
      '*': ' ',
      '"': ' ',
      '「': ' ',
      '」': ' ',
      '<': ' ',
      '>': ' ',
      '〈': ' ',
      '〉': ' ',
      '●': ' ',
      '○': ' ',
      1: ' ',
      2: ' ',
      3: ' ',
      4: ' ',
      5: ' ',
      6: ' ',
      7: ' ',
      8: ' ',
      9: ' ',
      0: ' ',
      '０': ' ',
      '１': ' ',
      '２': ' ',
      '３': ' ',
      '４': ' ',
      '５': ' ',
      '６': ' ',
      '７': ' ',
      '８': ' ',
      '９': ' ',
      '#': ' ',
      '[': ' ',
      ']': ' ',
      a: ' ',
      b: ' ',
      c: ' ',
      d: ' ',
      e: ' ',
      f: ' ',
      g: ' ',
      h: ' ',
      i: ' ',
      j: ' ',
      k: ' ',
      l: ' ',
      m: ' ',
      n: ' ',
      o: ' ',
      p: ' ',
      q: ' ',
      r: ' ',
      s: ' ',
      t: ' ',
      u: ' ',
      w: ' ',
      x: ' ',
      y: ' ',
      z: ' ',
      A: ' ',
      B: ' ',
      C: ' ',
      D: ' ',
      E: ' ',
      F: ' ',
      G: ' ',
      H: ' ',
      I: ' ',
      J: ' ',
      K: ' ',
      L: ' ',
      M: ' ',
      N: ' ',
      O: ' ',
      P: ' ',
      Q: ' ',
      R: ' ',
      S: ' ',
      T: ' ',
      U: ' ',
      W: ' ',
      X: ' ',
      Y: ' ',
      Z: ' ',
    };

    const result = {};
    result.ideogram = '';
    result.pinyin = '';

    let i = 0;

    const vogals = [
      'ā',
      'á',
      'ǎ',
      'à',
      'a',
      'ē',
      'é',
      'ě',
      'è',
      'e',
      'ō',
      'ó',
      'ǒ',
      'ò',
      'o',
    ];

    for (const ideogram of ideogramsList) {
      const character = ideograms[i];
      result.ideogram += character;

      if (i > 0 && ideogram.length > 0) {
        if (vogals.indexOf(ideogram[0].pronunciation[0]) > -1) {
          result.pinyin += "'";
        }
      }

      if (ideogram.length === 0) {
        if (specialsChars[character]) {
          result.pinyin += specialsChars[character];
        } else {
          result.pinyin += '__';
        }
      } else {
        result.pinyin += ideogram[0].pronunciation;
        if (options.pinyinAll) {
          result.pinyinAll = [];
          ideogram.forEach(word => {
            result.pinyinAll.push(word.pronunciation);
          });
        }
      }

      i += 1;
    }

    return result;
  }
  static async cleanPinyinCache() {
    await ArrayCache.clear();
  }

  static async toPinyin(ideograms, options = {}) {
    const result = await Promise.map(
      ideograms,
      async (ideogram, ideogramIndex) => {
        const words = await UnihanSearch.searchByWord(ideogram);
        const resultBlock = {};
        if (words) {
          resultBlock.ideogram = ideogram;
          resultBlock.pinyin = words;
          /* @todo Review This
        if (options.pinyinAll) {
          result.pinyinAll = [];
          words.forEach((word) => {
            result.pinyinAll.push(word.pronunciation);
          });
        }
        */

          return resultBlock;
        }
        let nextWord = '';
        if (ideograms[ideogramIndex + 1] !== undefined) {
          nextWord = ideograms[ideogramIndex + 1];
        }

        const ideogramsList = await UnihanSearch.searchByIdeograms(ideogram);
        const resultIdeograms = UnihanSearch.parseResultByIdeograms(
          ideogramsList,
          ideogram,
          nextWord,
          options,
        );
        const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(
          resultIdeograms.ideogram,
        );
        const cacheKey = `PINYIN_${ideogramConverted}`;

        await ArrayCache.set(cacheKey, resultIdeograms.pinyin);

        return resultIdeograms;
      },
      { concurrency: 20 },
    );

    const changeToneRules = UnihanSearch.getChangeToneRules();
    result.forEach((item, itemIndex) => {
      const pinyins = separatePinyinInSyllables(item.pinyin);
      item.ideogram.split('').forEach((ideogram, ideogramIndex) => {
        if (!changeToneRules[ideogram]) {
          return;
        }

        let nextPronunciation = '';
        if (pinyins[ideogramIndex + 1] !== undefined) {
          nextPronunciation = pinyins[ideogramIndex + 1];
        } else if (result[itemIndex + 1] !== undefined) {
          const nextLinePinyin = separatePinyinInSyllables(
            result[itemIndex + 1].pinyin,
          )
            .join(' ')
            .replace("'", '')
            .split(' ');
          nextPronunciation = nextLinePinyin[0];
        }

        const tone = UnihanSearch.extractPinyinTone(nextPronunciation);
        if (changeToneRules[ideogram][tone]) {
          pinyins[ideogramIndex] = changeToneRules[ideogram][tone];
          result[itemIndex].pinyin = pinyins.join('');
        }
      });
    });

    return result;
  }

  static pinyinTonesNumbersToAccents(text) {
    function getUpperCaseIndices(str) {
      const indices = [];
      for (let i = 0; i < str.length; i += 1) {
        if (str[i] === str[i].toUpperCase()) {
          indices.push(i);
        }
      }
      return indices;
    }

    function revertToUpperCase(str, indices) {
      const chars = str.split('');
      for (const idx of indices) {
        chars[idx] = chars[idx].toUpperCase();
      }
      return chars.join('');
    }

    const tonePtn = /([aeiouvüAEIOUVÜ]{1,2}(n|ng|r|'er|N|NG|R|'ER){0,1}[1234])/g;
    const toneMap = {
      a: ['ā', 'á', 'ǎ', 'à'],
      ai: ['āi', 'ái', 'ǎi', 'ài'],
      ao: ['āo', 'áo', 'ǎo', 'ào'],
      e: ['ē', 'é', 'ě', 'è'],
      ei: ['ēi', 'éi', 'ěi', 'èi'],
      i: ['ī', 'í', 'ǐ', 'ì'],
      ia: ['iā', 'iá', 'iǎ', 'ià'],
      ie: ['iē', 'ié', 'iě', 'iè'],
      io: ['iō', 'ió', 'iǒ', 'iò'],
      iu: ['iū', 'iú', 'iǔ', 'iù'],
      o: ['ō', 'ó', 'ǒ', 'ò'],
      ou: ['ōu', 'óu', 'ǒu', 'òu'],
      u: ['ū', 'ú', 'ǔ', 'ù'],
      ua: ['uā', 'uá', 'uǎ', 'uà'],
      ue: ['uē', 'ué', 'uě', 'uè'],
      ui: ['uī', 'uí', 'uǐ', 'uì'],
      uo: ['uō', 'uó', 'uǒ', 'uò'],
      v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
      ve: ['üē', 'üé', 'üě', 'üè'],
      ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
      üe: ['üē', 'üé', 'üě', 'üè'],
    };
    const tones = text.match(tonePtn);
    if (tones) {
      for (const coda of tones) {
        const toneIdx = parseInt(coda.slice(-1), 10) - 1;
        let vowel = coda.slice(0, -1);
        const suffix = vowel.match(/(n|ng|r|'er|N|NG|R|'ER)$/);
        vowel = vowel.replace(/(n|ng|r|'er|N|NG|R|'ER)$/, '');
        const upperCaseIdxs = getUpperCaseIndices(vowel);
        vowel = vowel.toLowerCase();
        let replacement = toneMap[vowel][toneIdx];
        if (suffix) {
          replacement = toneMap[vowel][toneIdx] + suffix[0];
        }

        text = text.replace(
          coda,
          revertToUpperCase(replacement, upperCaseIdxs),
        );
      }
    }

    return text;
  }

  static async exportPinyin() {
    const dirname = `${__dirname}/../../storage/`;

    const result = await knex('cjk').where({
      type: 'W',
    });
    let csvPinyin = 'ideogram;pinyin\n';
    result.forEach(cjk => {
      csvPinyin += `${this.convertUtf16ToIdeograms(cjk.ideogram)};${
        cjk.pronunciation
      }\n`;
    });

    const filenamePinyin = `${dirname}pinyin.csv`;
    await fs.writeFileAsync(filenamePinyin, csvPinyin);
  }
};
