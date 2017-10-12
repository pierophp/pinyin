const Promise = require('bluebird');
const env = require('../../env');
const db = require('sqlite');
const cheerio = require('cheerio');
const separatePinyinInSyllables = require('../../../shared/helpers/separate-pinyin-in-syllables');
const fs = Promise.promisifyAll(require('fs'));

let storagePath = `${__dirname}/../../storage/`;
if (env.storage_path) {
  storagePath = env.storage_path;
}

const bibleKeys = {
  1: 'genesis',
  2: 'exodus',
  3: 'leviticus',
  4: 'numbers',
  5: 'deuteronomy',
  6: 'joshua',
  7: 'judges',
  8: 'ruth',
  9: '1samuel',
  10: '2samuel',
  11: '1kings',
  12: '2kings',
  13: '1chronicles',
  14: '2chronicles',
  15: 'ezra',
  16: 'nehemiah',
  17: 'esther',
  18: 'job',
  19: 'psalms',
  20: 'proverbs',
  21: 'ecclesiastes',
  22: 'songofsolomon',
  23: 'isaiah',
  24: 'jeremiah',
  25: 'lamentations',
  26: 'ezekiel',
  27: 'daniel',
  28: 'hosea',
  29: 'joel',
  30: 'amos',
  31: 'obadiah',
  32: 'jonah',
  33: 'micah',
  34: 'nahum',
  35: 'habakkuk',
  36: 'zephaniah',
  37: 'haggai',
  38: 'zechariah',
  39: 'malachi',
  40: 'matthew',
  41: 'mark',
  42: 'luke',
  43: 'john',
  44: 'acts',
  45: 'romans',
  46: '1corinthians',
  47: '2corinthians',
  48: 'galatians',
  49: 'ephesians',
  50: 'philippians',
  51: 'colossians',
  52: '1thessalonians',
  53: '2thessalonians',
  54: '1timothy',
  55: '2timothy',
  56: 'titus',
  57: 'philemon',
  58: 'hebrews',
  59: 'james',
  60: '1peter',
  61: '2peter',
  62: '1john',
  63: '2john',
  64: '3john',
  65: 'jude',
  66: 'revelation',
};

const biblePath = `${__dirname}/../../../ui/static/bible/cmn-hans/`;

module.exports = class ImportBible {
  static async import() {
    await db.open(`${storagePath}bible.db`);
    const result = await db.all('SELECT * FROM verses');
    let lines = [];
    let line = [];
    let chapterNum = '';
    let bookId = '';

    await Promise.mapSeries(result, async(item) => {
      if (chapterNum !== item.chapter_num || bookId !== item.book_id) {

        lines.push(line);

        if (lines.length) {
          try {
            await fs.statAsync(`${biblePath}${bibleKeys[bookId]}`);
          } catch (e) {
            await fs.mkdirAsync(`${biblePath}${bibleKeys[bookId]}`);
          }

          await fs.writeFileAsync(`${biblePath}${bibleKeys[bookId]}/${chapterNum}.json`, JSON.stringify({ lines }));
        }


        lines = [];
        line = [];
        bookId = item.book_id;
        chapterNum = item.chapter_num;
      }

      const $ = cheerio.load(item.verse_text);
      let verseIndex = 0;
      const divContainer = $('div');
      $('table').each((i, table) => {
        $(table).find('tr').each((j, tr) => {
          $(tr).find('td').each((k, td) => {
            verseIndex += 1;

            const block = {
              c: $(td).find('p.c1').text().trim(),
            };

            if (verseIndex === 1 && line.length === 0) {
              block.line = {};
              block.line.pinyinSpaced = 1;
            }

            if (verseIndex === 1) {
              block.v = item.verse_num;
            }

            if ($(divContainer).hasClass('n') && verseIndex === 1) {
              block.n = 1;
            }

            const pinyin = $(td).find('p.r1');
            if (pinyin.length) {
              const pinyinList = separatePinyinInSyllables(pinyin.text().trim());
              block.p = pinyinList.join(String.fromCharCode(160));
            }

            line.push(block);
          });
        });
      });
    });

    lines.push(line);

    await fs.writeFileAsync(`${biblePath}${bibleKeys[bookId]}/${chapterNum}.json`, JSON.stringify({ lines }));
  }
};
