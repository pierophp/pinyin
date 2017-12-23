const knex = require('./knex');
const removeDiacritics = require('diacritics').remove;
const Promise = require('bluebird');
const fs = require('fs');
const xml2js = require('xml2js');
const replaceall = require('replaceall');
const UnihanSearch = require('../services/UnihanSearch');

module.exports = class UnihanDatabaseParser {
  static saveWord(pinyin, ideograms, definition = '') {
    const ideogramsConverted = UnihanSearch.convertIdeogramsToUtf16(ideograms);

    return new Promise(resolve => {
      knex('cjk')
        .insert({
          ideogram: ideogramsConverted,
          pronunciation: pinyin,
          pronunciation_unaccented: removeDiacritics(pinyin),
          definition_unihan: '',
          definition_pt: JSON.stringify([definition]),
          frequency: 1,
          language_id: 1,
          type: 'W',
          usage: 0,
          hsk: 999,
          created_at: new Date(),
        })
        .then(() => {
          resolve();
        })
        .error(() => {
          resolve();
        });
    });
  }

  static loadFile(file) {
    return new Promise((resolve, reject) => {
      knex.raw('SET NAMES utf8mb4;').then(() => {});
      knex.raw('SET character_set_results="utf8mb4";').then(() => {});
      knex.raw('SET character_set_client="utf8mb4";').then(() => {});
      knex.raw('SET character_set_connection="utf8mb4";').then(() => {});

      const parser = new xml2js.Parser();
      const data = fs.readFileSync(file);

      parser.parseString(data, (err, result) => {
        const chars = result.ucd.repertoire[0].char;
        const ideogramList = [];

        Promise.map(
          chars,
          char => {
            if (!char.$.kMandarin) {
              return false;
            }

            const ideogram = char.$.cp;

            if (ideogramList.indexOf(ideogram) !== -1) {
              return false;
            }

            ideogramList.push(ideogram);

            let frequency = char.$.kFrequency;

            if (!frequency) {
              frequency = 999;
            }

            const definition = char.$.kDefinition;

            return new Promise((resolveItem, rejectItem) => {
              knex('cjk')
                .where({
                  ideogram,
                })
                .then(dataCjk => {
                  if (dataCjk.length === 0) {
                    let simplified = 1;
                    let traditional = 1;
                    let variants = [];

                    if (char.$.kTraditionalVariant !== undefined) {
                      traditional = 0;
                      variants = replaceall(
                        'U+',
                        '',
                        char.$.kTraditionalVariant,
                      ).split(' ');
                    }

                    if (char.$.kSimplifiedVariant !== undefined) {
                      simplified = 0;
                      variants = replaceall(
                        'U+',
                        '',
                        char.$.kSimplifiedVariant,
                      ).split(' ');
                    }

                    knex('cjk')
                      .insert({
                        ideogram,
                        pronunciation: char.$.kMandarin,
                        pronunciation_unaccented: removeDiacritics(
                          char.$.kMandarin,
                        ),
                        definition_unihan: definition,
                        simplified,
                        variants: JSON.stringify(variants),
                        traditional,
                        frequency,
                        language_id: 1,
                        type: 'C',
                        usage: 0,
                        created_at: new Date(),
                      })
                      .then(() => {
                        resolveItem();
                      })
                      .error(() => {
                        rejectItem();
                      });
                  } else {
                    resolveItem();
                  }
                })
                .error(() => {
                  rejectItem();
                });
            });
          },
          {
            concurrency: 20,
          },
        )
          .then(() => {
            resolve();
          })
          .error(() => {
            reject();
          });
      });
    });
  }
};
