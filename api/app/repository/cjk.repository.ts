import * as bluebird from 'bluebird';
import * as replaceall from 'replaceall';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { profiler } from '../helpers/profiler';
import * as knex from '../services/knex';
import { BaseRepository } from './base.repository';
import { LanguageRepository } from './language.repository';
import { PhraseRepository } from './phrase.repository';

export class CjkRepository extends BaseRepository {
  static async findAll() {
    return await knex('cjk')
      .where({})
      // .limit(10)
      .orderBy('frequency', 'ASC')
      .select();
  }

  static async findAllIdeograms() {
    return await knex('cjk')
      .where({
        // ideogram_raw: '長',
        ideogram_raw: '我们',
      })
      .limit(10)
      //  .orderBy('frequency', 'ASC')
      .groupBy('ideogram_raw')
      .select('ideogram_raw');
  }

  static async findPtNotNull(): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(
        `definition_pt IS NOT NULL AND simplified = 1 AND (type = "W" OR (type = "C" AND frequency < 999))`,
      )
      .select();
  }

  static async findChineseToolsNotNull(language: string): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(
        `definition_ct_${language} IS NOT NULL AND simplified = 1 AND (type = "W" OR (type = "C" AND frequency < 999))`,
      )
      // .limit(10)
      .select();
  }

  static async findChineseToolsIsNull(
    language: string,
    limit: number,
  ): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(
        `definition_ct_${language} IS NULL AND simplified = 1 AND (type = "W" OR (type = "C" AND frequency < 999))`,
      )
      .limit(limit)
      .orderBy('hsk', 'ASC')
      .orderBy('usage', 'DESC')
      .select();
  }

  static async findGlosbeNotNull(language: string): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(
        `definition_glosbe_${language} IS NOT NULL AND simplified = 1 AND (type = "W" OR (type = "C" AND frequency < 999))`,
      )
      // .limit(10)
      .select();
  }

  static async findGlosbeIsNull(
    language: string,
    limit: number,
  ): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(
        `definition_glosbe_${language} IS NULL AND simplified = 1 AND (type = "W" OR (type = "C" AND frequency < 999))`,
      )
      .limit(limit)
      .orderBy('hsk', 'ASC')
      .orderBy('usage', 'DESC')
      .select();
  }

  static async findIdeogramRawIsNull(): Promise<any[]> {
    return await knex('cjk')
      .whereRaw(`ideogram_raw IS NULL`)
      .select();
  }

  static async searchPronunciationByWord(
    ideograms: string,
  ): Promise<string | undefined> {
    const ideogramsConverter = new IdeogramsConverter();
    const ideogramConverted = ideogramsConverter.convertIdeogramsToUtf16(
      ideograms,
    );
    let response: any = null;
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
        return response[0].pronunciation;
      }
    }

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
      return response[0].pronunciation;
    }

    return;
  }

  static async searchByIdeograms(ideograms: string): Promise<any> {
    const chars: string[] = [];
    for (let i = 0; i < ideograms.length; i += 1) {
      chars.push(ideograms[i].charCodeAt(0).toString(16));
    }
    return await bluebird.map(chars, async char => {
      return await knex('cjk')
        .where({
          ideogram: char,
          type: 'C',
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation');
    });
  }

  static async searchByIdeogramRaw(ideograms: string): Promise<any> {
    return await knex('cjk')
      .where({
        ideogram_raw: ideograms,
      })
      .orderBy('main', 'DESC')
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select();
  }

  static async save(params) {
    // let action = 'insert';

    if (params.id) {
      params.updated_at = new Date();

      await knex('cjk')
        .where('id', '=', params.id)
        .update(params);
    } else {
      params.created_at = new Date();

      params.id = (await knex('cjk')
        .insert(params)
        .returning('id'))[0];
    }

    const cjk = (await knex('cjk').where({
      id: params.id,
    }))[0];

    const elasticsearchProvider = new ElasticsearchProvider();
    await elasticsearchProvider.saveMany([cjk]);
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

    const ideogramsConverter = new IdeogramsConverter();

    await bluebird.mapSeries(items, async (item: any) => {
      let ideograms = ideogramsConverter.convertUtf16ToIdeograms(item.ideogram);
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

      await bluebird.mapSeries(phrases, async (phrase: any) => {
        await knex('cjk_has_phrase').insert({
          cjk_id: item.id,
          phrase_id: phrase.id,
        });
      });
    });
  }
}
