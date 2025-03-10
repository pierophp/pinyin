const Promise = require('bluebird');
const fs = require('fs');
const moment = require('moment');
const fastCsv = require('fast-csv');
const isChinese = require('../helpers/is-chinese');
const { LanguageRepository } = require('../repository/language.repository');
const { PhraseRepository } = require('../repository/phrase.repository');
const UnihanSearch = require('../services/UnihanSearch');
const separateWords = require('../helpers/separate.words');
const profiler = require('../helpers/profiler').profiler;
const { IdeogramsConverter } = require('../core/converter/ideograms.converter');

const separatePinyinInSyllables = require('../helpers/separate-pinyin-in-syllables');
const exec = require('child-process-promise').exec;

const path = require('path');

const ideogramsConverter = new IdeogramsConverter();

const languages = {
  por: 'pt',
  eng: 'en',
  spa: 'es',
  cmn: 'cmn-hans',
};
let storagePath = path.resolve(`${__dirname}/../../../storage/`);
storagePath += '/';

const storagePathEnv = process.env['STORAGE_PATH'];
if (storagePathEnv) {
  storagePath = storagePathEnv;
}

module.exports = class Tatoeba {
  static async filter() {
    const languagesKeys = Object.keys(languages);
    const filter = [];
    languagesKeys.forEach((item) => {
      filter.push(`$2 == "${item}"`);
    });

    const command = `awk '{ if (${filter.join(
      ' || ',
    )}) print }' ${storagePath}sentences_detailed.csv > ${storagePath}sentences_detailed.filtered.csv`;
    await exec(command);
  }

  static async import() {
    let i = 0;

    return new Promise(async (resolve) => {
      const fileStream = fs.createReadStream(
        `${storagePath}sentences_detailed.filtered.csv`,
      );

      const writableStream = fs.createWriteStream(
        `${storagePath}sentences_import.csv`,
      );
      const fileWriteStream = fastCsv.createWriteStream({
        headers: false,
        delimiter: ';',
      });
      fileWriteStream.pipe(writableStream);

      const parser = fastCsv
        .fromStream(fileStream, {
          delimiter: '\t',
          ignoreEmpty: true,
          quote: '',
          escape: '',
        })
        .on('data', async (data) => {
          parser.pause();
          const id = data[0];
          const languageCode = data[1];
          let phrase = data[2];
          let dateCreatedAt = data[4];
          let dateUpdatedAt = data[5];

          if (dateUpdatedAt === '\\N') {
            dateUpdatedAt = moment().format('Y-MM-DD HH:mm:ss');
          }

          if (dateUpdatedAt === '0000-00-00 00:00:00') {
            dateUpdatedAt = moment().format('Y-MM-DD HH:mm:ss');
          }

          if (dateCreatedAt === '\\N') {
            dateCreatedAt = moment().format('Y-MM-DD HH:mm:ss');
          }

          if (dateCreatedAt === '0000-00-00 00:00:00') {
            dateCreatedAt = moment().format('Y-MM-DD HH:mm:ss');
          }

          if (languages[languageCode] === undefined) {
            data = null;
            parser.resume();
            return;
          }

          i += 1;
          if (i % 100 === 1) {
            profiler(`Start ${i} `, true);
          }
          let pronunciation = '';

          if (languageCode === 'cmn') {
            phrase = await ideogramsConverter.traditionalToSimplified(phrase);
            const ideograms = await separateWords(phrase);
            const ideogramsList = [];
            let ideogramsTemp = '';
            ideograms.forEach((ideogram) => {
              if (isChinese(ideogram)) {
                if (ideogramsTemp) {
                  ideogramsList.push(ideogramsTemp);
                  ideogramsTemp = '';
                }
                ideogramsList.push(ideogram);
              } else {
                ideogramsTemp += ideogram;
              }
            });

            if (ideogramsTemp) {
              ideogramsList.push(ideogramsTemp);
            }

            const pinyin = await UnihanSearch.toPinyin(ideogramsList);
            const pinyinList = [];
            pinyin.forEach((item) => {
              const pinyinConverted = separatePinyinInSyllables(
                item.pinyin,
              ).join(String.fromCharCode(160));
              pinyinList.push(pinyinConverted);
            });

            pronunciation = pinyinList.join('|');
          }

          const language = await LanguageRepository.findOneByCode(
            languages[languageCode],
          );
          let phraseData = {
            phrase,
            pronunciation,
            language_id: language.id,
            provider_created_at: dateCreatedAt,
            provider_updated_at: dateUpdatedAt,
            provider_id: id,
          };

          fileWriteStream.write(phraseData);

          if (i % 100 === 1) {
            profiler(`End ${i}`, true);
          }

          data = null;
          phraseData = null;

          if (i % 10000 === 1) {
            profiler('Clean Pinyin Cache');
            await UnihanSearch.cleanPinyinCache();
          }

          if (i % 1000 === 1) {
            profiler('Clean GC');
            global.gc();
          }

          parser.resume();
        })
        .on('end', async () => {
          fileWriteStream.end();
          resolve();
        });
    });
  }

  static async references() {
    return new Promise(async (resolve) => {
      const fileStream = fs.createReadStream(`${storagePath}links.csv`);
      fastCsv
        .fromStream(fileStream, {
          delimiter: '\t',
          ignoreEmpty: true,
          quote: '',
          escape: '',
        })
        .transform((data, next) => {
          const fromId = data[0];
          const toId = data[1];

          return new Promise(async () => {
            const phraseReference = {
              fromId,
              toId,
              provider: 'tatoeba',
            };

            await PhraseRepository.saveReference(phraseReference);

            next(null);
          });
        })
        .on('data', () => {})
        .on('end', () => {
          resolve();
        });
    });
  }
};
