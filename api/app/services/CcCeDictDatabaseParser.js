const knex = require('./knex');
const Promise = require('bluebird');
const UnihanSearch = require('../services/UnihanSearch');
const readline = require('readline');
const fs = require('fs');
const replaceall = require('replaceall');

module.exports = class CcCeDictDatabaseParser {

  static loadFile(file) {
    return new Promise((resolve, reject) => {
      const promises = [];

      function processPromisses() {
        // eslint-disable-next-line
        console.log('Promise process init');
        Promise.map(promises, promiseImport =>
          promiseImport()
        , {
          concurrency: 2,
        }).then(() => {
          resolve();
        }).error(() => {
          reject();
        });
      }

      const ideogramList = [];

      function readLine(line) {
        if (!line) {
          return null;
        }

        let parts = line.split('/');
        const ideogramParts = parts[0].split(' ');
        let ideogram = ideogramParts[1];
        let ideogramTraditional = ideogramParts[0];

        parts = line.split('/');

        let pronunciation = '';
        const pronunciationList = parts[0]
                      .split('[')[1]
                      .replace(']', '')
                      .toLowerCase()
                      .split(' ');

        const vogals = ['a', 'e', 'o'];
        pronunciationList.forEach((p, index) => {
          if (index > 0) {
            if (vogals.indexOf(p[0]) > -1) {
              pronunciation += "'";
            }
          }
          pronunciation += p;
        });

        pronunciation = replaceall('u:', 'ü', pronunciation);

        const pronunciationUnaccented = pronunciation.replace(new RegExp('[12345]', 'g'), '');
        pronunciation = UnihanSearch
                            .pinyinTonesNumbersToAccents(pronunciation)
                            .replace(new RegExp('5', 'g'), '');

        const key = ideogram + pronunciation;

        if (ideogramList.indexOf(key) !== -1) {
          return null;
        }

        ideogramList.push(key);
        const importPromise = async () => {
          parts.shift();
          const descriptions = [];
          const measureWords = [];
          let variants = [];

          for (const part of parts) {
            if (part.substr(0, 3) !== 'CL:') {
              if (part) {
                descriptions.push(part);
              }
              continue;
            }

            const measureWordsTmp = part.replace('CL:', '').split(',');
            for (let measureWord of measureWordsTmp) {
              measureWord = measureWord.split('[')[0].split('|');
              if (measureWord[1] !== undefined) {
                measureWord = measureWord[1];
              } else {
                measureWord = measureWord[0];
              }

              measureWords.push(measureWord);
            }
          }

          ideogram = UnihanSearch.convertIdeogramsToUtf16(ideogram);
          ideogramTraditional = UnihanSearch.convertIdeogramsToUtf16(ideogramTraditional);

          let traditional = 0;
          if (ideogramTraditional === ideogram) {
            traditional = 1;
          } else {
            variants.push(ideogramTraditional);
          }

          const toInsert = {
            ideogram,
            pronunciation,
            pronunciation_unaccented: pronunciationUnaccented,
            definition_cedict: JSON.stringify(descriptions),
            language_id: 1,
            measure_words: JSON.stringify(measureWords),
            type: 'W',
            usage: 0,
            created_at: new Date(),
            simplified: 1,
            traditional,
            variants: JSON.stringify(variants),
          };

          const toUpdate = {
            simplified: 1,
            traditional,
            definition_cedict: JSON.stringify(descriptions),
            measure_words: JSON.stringify(measureWords),
            variants: JSON.stringify(variants),
          };

          let dataCjk = await knex('cjk')
            .select('id')
            .where({
              ideogram,
              pronunciation,
            });


          if (dataCjk.length === 0) {
            await knex('cjk').insert(toInsert);
          } else {
            await knex('cjk').where('id', '=', dataCjk[0].id).update(toUpdate);
          }

          if (ideogramTraditional !== ideogram) {
            variants = [];
            variants.push(ideogram);

            dataCjk = await knex('cjk')
            .select('id')
            .where({
              ideogram: ideogramTraditional,
              pronunciation,
            });

            if (dataCjk.length === 0) {
              toInsert.ideogram = ideogramTraditional;
              toInsert.simplified = 0;
              toInsert.traditional = 1;
              toInsert.variants = JSON.stringify(variants);

              await knex('cjk').insert(toInsert);
            } else {
              toUpdate.ideogram = ideogramTraditional;
              toUpdate.simplified = 0;
              toUpdate.traditional = 1;
              toUpdate.variants = JSON.stringify(variants);

              await knex('cjk').where('id', '=', dataCjk[0].id).update(toUpdate);
            }
          }
        };

        return importPromise;
      }

      const lineReader = readline.createInterface({
        input: fs.createReadStream(file),
      });

      lineReader.on('close', () => {
        processPromisses();
      });

      lineReader.on('line', (line) => {
        if (line[0] === '#') {
          return;
        }

        const importPromisse = readLine(line);
        if (!importPromisse) {
          return;
        }

        promises.push(importPromisse);
        return;
      });
    });
  }
};

