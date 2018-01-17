const knex = require('./knex');
const removeDiacritics = require('diacritics').remove;
const Promise = require('bluebird');
const UnihanSearch = require('../services/UnihanSearch');
const readline = require('readline');
const fs = require('fs');
const replaceall = require('replaceall');

module.exports = class ThreeLinesDatabaseParser {
  static saveWord(pinyin, ideograms) {
    pinyin = replaceall('_', '', pinyin);
    let ideogramsConverted = '';

    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted += ideograms[i].charCodeAt(0).toString(16);
    }

    return new Promise(resolve => {
      knex('cjk')
        .insert({
          ideogram: ideogramsConverted,
          pronunciation: pinyin,
          pronunciation_unaccented: removeDiacritics(pinyin),
          definition: '',
          frequency: 1,
          language_id: 1,
          type: 'W',
          usage: 0,
          created_at: new Date(),
        })
        .then(() => {
          resolve();
        });
    });
  }

  static loadFile(file) {
    return new Promise((resolve, reject) => {
      const promises = [];

      function processPromisses() {
        // eslint-disable-next-line
        console.log('Promise process init');
        Promise.map(promises, promiseImport => promiseImport(), {
          concurrency: 2,
        })
          .then(() => {
            resolve();
          })
          .error(() => {
            reject();
          });
      }

      const ideogramList = [];

      function readLine(line) {
        if (!line) {
          return null;
        }

        const parts = line.split('\t');
        let ideogram = parts[1];

        let pronunciation = '';
        const pronunciationList = parts[2].toLowerCase().split(' ');

        const vogals = ['a', 'e', 'o'];
        pronunciationList.forEach((p, index) => {
          if (index > 0) {
            if (vogals.indexOf(p[0]) > -1) {
              pronunciation += "'";
            }
          }
          pronunciation += p;
        });

        // pronunciation = replaceall('u:', 'ü', pronunciation);

        const pronunciationUnaccented = pronunciation.replace(
          new RegExp('[12345]', 'g'),
          '',
        );
        pronunciation = UnihanSearch.pinyinTonesNumbersToAccents(
          pronunciation,
        ).replace(new RegExp('5', 'g'), '');

        const key = ideogram + pronunciation;

        if (ideogramList.indexOf(key) !== -1) {
          return null;
        }

        const descriptionParts = parts[7].split('/');

        ideogramList.push(key);
        const importPromise = () => {
          return new Promise((resolveImport, rejectImport) => {
            const descriptions = [];
            for (const part of descriptionParts) {
              if (part) {
                descriptions.push(part.replace(new RegExp('<(.*)>', 'g'), ''));
              }
            }

            ideogram = UnihanSearch.convertIdeogramsToUtf16(ideogram);

            knex('cjk')
              .select('id')
              .where({
                ideogram,
                pronunciation,
              })
              .then(dataCjk => {
                if (dataCjk.length === 0) {
                  const toInsert = {
                    ideogram,
                    pronunciation,
                    pronunciation_unaccented: pronunciationUnaccented,
                    definition_pt: JSON.stringify(descriptions),
                    language_id: 1,
                    type: 'W',
                    usage: 0,
                    created_at: new Date(),
                  };

                  knex('cjk')
                    .insert(toInsert)
                    .then(() => {
                      resolveImport();
                    })
                    .error(err => {
                      // eslint-disable-next-line
                      console.log(err);
                      rejectImport();
                    });
                } else {
                  knex('cjk')
                    .where('id', '=', dataCjk[0].id)
                    .update({
                      definition_pt: JSON.stringify(descriptions),
                    })
                    .then(() => {
                      resolveImport();
                    })
                    .error(() => {
                      rejectImport();
                    });
                }
              })
              .error(() => {
                rejectImport();
              });
          });
        };

        return importPromise;
      }

      const lineReader = readline.createInterface({
        input: fs.createReadStream(file),
      });

      lineReader.on('close', () => {
        processPromisses();
      });

      lineReader.on('line', line => {
        if (line.trim().substr(0, 11) === 'Traditional') {
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
