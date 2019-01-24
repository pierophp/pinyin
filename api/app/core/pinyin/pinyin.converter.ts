import * as bluebird from 'bluebird';
import * as separatePinyinInSyllables from '../../../../shared/helpers/separate-pinyin-in-syllables';
import { ArrayCache } from '../../cache/array.cache';
import { RedisCache } from '../../cache/redis.cache';
import ideogramPinyinRules from '../../core/converter/ideogram.pinyin.rules';
import { IdeogramsConverter } from '../../core/converter/ideograms.converter';
import { CjkRepository } from '../../repository/cjk.repository';
import extractPinyinTone from '../../helpers/extract-pinyin-tone';
interface ResultBlockInterface {
  ideogram: string;
  pinyin: string;
  pinyinAll?: string[];
}

export class PinyinConverter {
  ideogramsConverter: IdeogramsConverter;
  constructor() {
    this.ideogramsConverter = new IdeogramsConverter();
  }

  protected getIdeogramPinyinRules() {
    return ideogramPinyinRules;
  }
  protected getChangeToneRules() {
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

  public async searchByWord(ideograms: string): Promise<string> {
    const cacheKey = `PINYIN_${ideograms}`;

    if (await ArrayCache.has(cacheKey)) {
      return await ArrayCache.get(cacheKey);
    }

    let response = await RedisCache.get(cacheKey);

    await RedisCache.forget(cacheKey);

    if (response && response !== true) {
      await ArrayCache.set(cacheKey, response);
      return response;
    }

    const cacheResponse =
      (await CjkRepository.searchPronunciationByWord(ideograms)) || '';

    await ArrayCache.set(cacheKey, cacheResponse);
    await RedisCache.set(cacheKey, cacheResponse, 60 * 60 * 12); // 1 day

    return cacheResponse;
  }

  public parseResultByIdeograms(
    ideogramsList: any,
    ideograms: string,
    nextWord: string,
    options: { pinyinAll?: boolean },
  ): ResultBlockInterface {
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
      '『': ' ',
      '』': ' ',
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

    const result: ResultBlockInterface = {
      ideogram: '',
      pinyin: '',
    };

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
          for (const word of ideogram) {
            result.pinyinAll.push(word.pronunciation);
          }
        }
      }

      i += 1;
    }

    return result;
  }

  public async toPinyin(
    ideograms: string[],
    options = {},
  ): Promise<ResultBlockInterface[]> {
    const result = await bluebird.map(
      ideograms,
      async (ideogram, ideogramIndex) => {
        const words = await this.searchByWord(ideogram);
        const resultBlock: ResultBlockInterface = {
          ideogram: '',
          pinyin: '',
        };

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

        const ideogramsList = await CjkRepository.searchByIdeograms(ideogram);
        const resultIdeograms = this.parseResultByIdeograms(
          ideogramsList,
          ideogram,
          nextWord,
          options,
        );

        const cacheKey = `PINYIN_${resultIdeograms.ideogram}`;

        await ArrayCache.set(cacheKey, resultIdeograms.pinyin);

        return resultIdeograms;
      },
      { concurrency: 20 },
    );

    const changeToneRules = this.getChangeToneRules();

    result.forEach((item, itemIndex) => {
      const pinyins = separatePinyinInSyllables(item.pinyin);
      const ideogram = item.ideogram || '';

      ideogram.split('').forEach((ideogram, ideogramIndex) => {
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

        const tone = extractPinyinTone(nextPronunciation);

        if (
          changeToneRules[ideogram][tone] &&
          pinyins[ideogramIndex] !== 'bu'
        ) {
          pinyins[ideogramIndex] = changeToneRules[ideogram][tone];
          result[itemIndex].pinyin = pinyins.join('');
        }
      });
    });

    const ideogramPinyinRules = this.getIdeogramPinyinRules();

    result.forEach((item, itemIndex) => {
      if (!ideogramPinyinRules[item.ideogram || '']) {
        return;
      }

      if (!result[itemIndex + 1]) {
        return;
      }

      const nextIdeogram = result[itemIndex + 1].ideogram;
      if (!ideogramPinyinRules[item.ideogram || ''][nextIdeogram]) {
        return;
      }

      result[itemIndex + 1].pinyin =
        ideogramPinyinRules[item.ideogram || ''][nextIdeogram];
    });

    return result;
  }

  static async cleanPinyinCache() {
    await ArrayCache.clear();
  }
}
