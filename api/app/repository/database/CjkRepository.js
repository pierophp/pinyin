const Promise = require('bluebird');
const replaceall = require('replaceall');
const BaseRepository = require('./BaseRepository');
const LanguageRepository = require('../LanguageRepository');
const PhraseRepository = require('../PhraseRepository');
const knex = require('../../services/knex');
const UnihanSearch = require('../../services/UnihanSearch');
const profiler = require('../../helpers/profiler');

module.exports = class CjkRepository extends BaseRepository {
  static async findAll() {
    await knex('cjk')
      .where()
      .limit(10);
  }

  static async searchPronunciationByWord(ideograms) {
    const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(ideograms);
    let response = null;
    if (ideograms.length === 1) {
      response = await knex('cjk')
        .where({
          ideogram: ideogramConverted,
          type: 'C',
        })
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation');

      if (response.length > 0) {
        return response[0].pronunciation;
      }
    }

    response = await knex('cjk')
      .where({
        ideogram: ideogramConverted,
        type: 'W',
      })
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select('id', 'pronunciation');

    if (response.length > 0) {
      return response[0].pronunciation;
    }

    return null;
  }

  static async save(cjk) {
    // let action = 'insert';
    if (cjk.id) {
      // action = 'update';
      await knex('cjk')
        .where('id', '=', cjk.id)
        .update(cjk);
    } else {
      await knex('cjk').insert(cjk);
    }
  }

  static async referencePhrases() {
    const words = await knex('cjk')
      .where({
        type: 'W',
        simplified: 1,
      })
      .select('id', 'ideogram');

    const characters = await knex('cjk')
      .whereRaw('type = "C" AND frequency < 999 AND simplified = 1')
      .select('id', 'ideogram');

    const items = words.concat(characters);

    const language = await LanguageRepository.findOneByCode('cmn-hans');

    let i = 0;

    await Promise.mapSeries(items, async item => {
      let ideograms = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
      ideograms = replaceall('%', '', ideograms);
      if (!ideograms) {
        return;
      }

      i += 1;

      profiler(`${i} - ${ideograms}`);

      const phrases = await PhraseRepository.findByLanguageAndRlike(
        language,
        ideograms,
      );
      if (phrases.length === 0) {
        return;
      }

      await Promise.mapSeries(phrases, async phrase => {
        await knex('cjk_has_phrase').insert({
          cjk_id: item.id,
          phrase_id: phrase.id,
        });
      });
    });
  }
};
