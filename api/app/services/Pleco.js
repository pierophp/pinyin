const Promise = require('bluebird');
const knex = require('./knex');
const UnihanSearch = require('../services/UnihanSearch');
const separatePinyinInSyllables = require('../../../shared/helpers/separate-pinyin-in-syllables');
const extractPinyinTone = require('../helpers/extract-pinyin-tone');
const removeDiacritics = require('diacritics').remove;
const exec = require('child_process').exec;
const fs = Promise.promisifyAll(require('fs'));
const env = require('../../env');

module.exports = class Pleco {
  static async export() {
    let dirname = `${__dirname}/../../storage/`;
    if (env.storage_path) {
      dirname = `${env.storage_path}/`;
    }
    const result = await knex('cjk').whereRaw('definition_pt IS NOT NULL');
    let resultFile = '';
    result.forEach(entry => {
      let definition = JSON.parse(entry.definition_pt);
      definition = definition.join(String.fromCharCode(60081));
      const pinyin = separatePinyinInSyllables(entry.pronunciation);
      let pinyinTones = '';
      pinyin.forEach(syllable => {
        let tone = extractPinyinTone(syllable);
        if (tone === 0) {
          tone = 5;
        }
        pinyinTones += `${removeDiacritics(syllable)}${tone}`;
      });

      const ideograms = UnihanSearch.convertUtf16ToIdeograms(entry.ideogram);
      const line = `${ideograms}\t${pinyinTones}\t${definition}\n`;
      resultFile += line;
    });

    resultFile = resultFile.trim('\n');

    // eslint-disable-next-line
    const filenamePleco = `${dirname}PlecoDictionaryUTf8.txt`;
    const filenamePlecoUTF16 = `${dirname}Dicionario_Pleco.txt`;
    await fs.writeFileAsync(filenamePleco, resultFile);
    exec(`iconv -f UTF-8 -t UTF-16LE ${filenamePleco} > ${filenamePlecoUTF16}`);
  }
};
