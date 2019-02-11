const { uniq } = require('lodash');

const knex = require('./knex');
const { IdeogramsConverter } = require('../core/converter/ideograms.converter');
const ideogramsConverter = new IdeogramsConverter();

module.exports = class UnihanSearch {
  static async searchToDictionaryPartial(ideograms) {
    let searchedIdeograms = '';
    let partialIdeograms = ideograms;
    let listResponse = [];
    while (partialIdeograms !== '') {
      const response = await this.searchToDictionary({
        ideograms: partialIdeograms,
      });

      if (response.pronunciation) {
        searchedIdeograms += partialIdeograms;
        partialIdeograms = ideograms.substr(searchedIdeograms.length);
        listResponse.push(response);
      } else {
        partialIdeograms = partialIdeograms.substr(
          0,
          partialIdeograms.length - 1,
        );
      }
    }

    return listResponse;
  }

  static async searchToDictionary(search) {
    let where = {};
    let simplifiedIdeogram = '';
    if (search.ideograms !== undefined) {
      simplifiedIdeogram = await ideogramsConverter.traditionalToSimplified(
        search.ideograms,
      );

      where.ideogram = ideogramsConverter.convertIdeogramsToUtf16(
        simplifiedIdeogram,
      );
    }

    if (search.pinyin !== undefined) {
      where.pronunciation = search.pinyin;
    }

    if (search.id !== undefined) {
      where.id = search.id;
    }

    const fields = [
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
      'definition_3lines_en',
      'definition_3lines_es',
      'hsk',
      'variants',
      'measure_words',
      'is_separable',
    ];

    let cjkList = await knex('cjk')
      .where(where)
      .orderBy('main', 'DESC')
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select(...fields);

    let cjkListTraditional = [];
    if (
      search.ideograms !== undefined &&
      search.ideograms !== simplifiedIdeogram
    ) {
      where.ideogram = ideogramsConverter.convertIdeogramsToUtf16(
        search.ideograms,
      );
      cjkListTraditional = await knex('cjk')
        .where(where)
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select(...fields);
    }

    if (cjkList.length === 0 && search.pinyin && search.ideograms) {
      where = {};
      where.ideogram = ideogramsConverter.convertIdeogramsToUtf16(
        simplifiedIdeogram,
      );
      cjkList = await knex('cjk')
        .where(where)
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select(...fields);
    }

    if (
      cjkListTraditional.length === 0 &&
      search.pinyin &&
      search.ideograms &&
      search.ideograms !== simplifiedIdeogram
    ) {
      where = {};
      where.ideogram = ideogramsConverter.convertIdeogramsToUtf16(
        search.ideograms,
      );
      cjkListTraditional = await knex('cjk')
        .where(where)
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select(...fields);
    }

    const response = {};
    response.search_ideograms = search.ideograms;
    response.ideograms = search.ideograms;
    response.measure_words = null;
    response.variants = null;
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
    response.es = null;
    response.en = null;

    const list = cjkListTraditional.concat(cjkList);

    for (const cjk of list) {
      const ideograms = ideogramsConverter.convertUtf16ToIdeograms(
        cjk.ideogram,
      );

      if (!response.pronunciation) {
        response.pronunciation = cjk.pronunciation;
      }

      if (!response.ideograms) {
        response.ideograms = ideograms;
      }

      if (!response.hsk) {
        response.hsk = cjk.hsk;
      }

      if (!response.is_separable) {
        response.is_separable = cjk.is_separable;
      }

      if (!response.variants) {
        if (cjk.variants) {
          response.variants = JSON.parse(cjk.variants);
        } else {
          if (simplifiedIdeogram && simplifiedIdeogram !== search.ideograms) {
            response.variants = [simplifiedIdeogram];
          } else {
            response.variants = [
              await ideogramsConverter.simplifiedToTraditional(ideograms),
            ];
          }
        }
      }

      if (!response.measure_words) {
        if (cjk.measure_words) {
          response.measure_words = JSON.parse(cjk.measure_words);
        }
      }

      if (!response.unihan && cjk.definition_unihan) {
        response.unihan = [cjk.definition_unihan];
      }

      if (!response.pt && cjk.definition_pt) {
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

      if (!response.chinese_tools_pt && cjk.definition_ct_pt) {
        response.chinese_tools_pt = JSON.parse(cjk.definition_ct_pt);
      }

      if (!response.chinese_tools_es && cjk.definition_ct_es) {
        response.chinese_tools_es = JSON.parse(cjk.definition_ct_es);
      }

      if (!response.chinese_tools_en && cjk.definition_ct_en) {
        response.chinese_tools_en = JSON.parse(cjk.definition_ct_en);
      }

      if (!response.glosbe_pt && cjk.definition_glosbe_pt) {
        response.glosbe_pt = JSON.parse(cjk.definition_glosbe_pt);
      }

      if (!response.glosbe_es && cjk.definition_glosbe_es) {
        response.glosbe_es = JSON.parse(cjk.definition_glosbe_es);
      }

      if (!response.glosbe_en && cjk.definition_glosbe_en) {
        response.glosbe_en = JSON.parse(cjk.definition_glosbe_en);
      }

      if (!response.en && cjk.definition_3lines_en) {
        response.en = JSON.parse(cjk.definition_3lines_en);
      }

      if (!response.es && cjk.definition_3lines_es) {
        response.es = JSON.parse(cjk.definition_3lines_es);
      }
    }

    if (response.cedict) {
      response.cedict = uniq(response.cedict);
    }

    return response;
  }
};
