import { Client } from 'elasticsearch';
import { IdeogramsConverter } from '../converter/ideograms.converter';
import * as isChinese from '../../helpers/is-chinese';
import * as bluebird from 'bluebird';

let client;
const ideogramsConverter = new IdeogramsConverter();

export class ElasticsearchProvider {
  public async createStructure() {
    const mappings: any = {
      properties: {
        id: { type: 'integer' },
        ideogram: { type: 'text' },
        ideogramKeyword: { type: 'keyword' },
        pronunciation: { type: 'text' },
        pronunciationKeyword: { type: 'keyword' },
        pronunciationUnaccented: { type: 'text' },
        pronunciationUnaccentedKeyword: { type: 'keyword' },
        'dictionary.unihan': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.cedict': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.cedictKeyword': { type: 'keyword' },
        'dictionary.pt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.3LinesEn': { type: 'text', analyzer: 'analyzer_es' },
        'dictionary.3LinesEs': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.ptKeyword': { type: 'keyword' },
        'dictionary.ctPt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.ctEn': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.ctEs': { type: 'text', analyzer: 'analyzer_es' },
        'dictionary.glosbePt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.glosbeEn': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.glosbeEs': { type: 'text', analyzer: 'analyzer_es' },
        type: { type: 'keyword' },
        simplified: { type: 'boolean' },
        traditional: { type: 'boolean' },
        variants: { type: 'text', index: false },
        main: { type: 'integer', index: false },
        usage: { type: 'integer', index: false },
        frequency: { type: 'integer', index: false },
        frequencyInverse: { type: 'integer', index: false },
        hsk: { type: 'integer', index: false },
        hskInverse: { type: 'integer', index: false },
        createdAt: {
          type: 'date',
          format: 'strict_date_optional_time||epoch_millis',
          index: false,
        },
        updatedAt: {
          type: 'date',
          format: 'strict_date_optional_time||epoch_millis',
          index: false,
        },
      },
    };

    try {
      await this.getClient().indices.delete({
        index: this.getIndex(),
      });
    } catch (e) {}

    await this.getClient().indices.create({
      index: this.getIndex(),
      body: {
        settings: {
          analysis: {
            filter: {
              stemmer_brazilian: {
                type: 'stemmer',
                // language: 'brazilian',
                name: 'light_portuguese',
              },
              stemmer_english: {
                type: 'stemmer',
                name: 'minimal_english',
              },
              stemmer_spanish: {
                type: 'stemmer',
                name: 'light_spanish',
              },
            },
            analyzer: {
              analyzer_pt: {
                tokenizer: 'standard',
                filter: [
                  'word_delimiter',
                  'lowercase',
                  'stemmer_brazilian',
                  'asciifolding',
                ],
              },
              analyzer_en: {
                tokenizer: 'standard',
                filter: [
                  'word_delimiter',
                  'lowercase',
                  'stemmer_english',
                  'asciifolding',
                ],
              },
              analyzer_es: {
                tokenizer: 'standard',
                filter: [
                  'word_delimiter',
                  'lowercase',
                  'stemmer_spanish',
                  'asciifolding',
                ],
              },
            },
          },
        },
        mappings,
      },
    });
  }

  protected async getUpdateDocument(dictionary: any): Promise<any> {
    const cedict = JSON.parse(dictionary.definition_cedict);
    const pt = JSON.parse(dictionary.definition_pt);

    const ctPt = JSON.parse(dictionary.definition_ct_pt);
    const ctEn = JSON.parse(dictionary.definition_ct_en);
    const ctEs = JSON.parse(dictionary.definition_ct_es);

    const glosbePt = JSON.parse(dictionary.definition_glosbe_pt);
    const glosbeEn = JSON.parse(dictionary.definition_glosbe_en);
    const glosbeEs = JSON.parse(dictionary.definition_glosbe_es);

    const threeLinesEn = JSON.parse(dictionary.definition_3lines_en);
    const threeLinesEs = JSON.parse(dictionary.definition_3lines_es);

    const variants = JSON.parse(dictionary.variants);

    return {
      id: dictionary.id,
      ideogram: dictionary.ideogram_raw,
      pronunciation: dictionary.pronunciation,
      pronunciationUnaccented: dictionary.pronunciation_unaccented,
      ideogramKeyword: dictionary.ideogram_raw,
      pronunciationKeyword: dictionary.pronunciation,
      pronunciationUnaccentedKeyword: dictionary.pronunciation_unaccented,
      dictionary: {
        unihan: dictionary.definition_unihan,
        cedict,
        cedictKeyword: cedict,
        pt,
        ptKeyword: pt,
        ctPt,
        ctEn,
        ctEs,
        glosbePt,
        glosbeEn,
        glosbeEs,
        '3LinesEn': threeLinesEn,
        '3LinesEs': threeLinesEs,
      },
      type: dictionary.type,
      simplified: dictionary.simplified ? true : false,
      traditional: dictionary.traditional ? true : false,
      variants,
      main: dictionary.main ? 1 : 0,
      usage: dictionary.usage || 0,
      frequency: dictionary.frequency || 0,
      frequencyInverse:
        10 - (dictionary.frequency === 999 ? 9 : dictionary.frequency),
      hsk: dictionary.hsk === 999 ? 0 : dictionary.hsk,
      hskInverse: 10 - (dictionary.hsk === 999 ? 9 : dictionary.hsk),
      createdAt: dictionary.created_at,
      updatedAt: dictionary.updated_at,
    };
  }

  public async saveMany(dictionaryList: any[]) {
    const body: any[] = [];
    for (const dictionary of dictionaryList) {
      body.push({
        update: {
          _index: this.getIndex(),
          _id: String(dictionary.id),
        },
      });

      body.push({
        doc: await this.getUpdateDocument(dictionary),
        doc_as_upsert: true,
      });
    }

    const response = await this.getClient().bulk({
      index: this.getIndex(),
      body,
    });

    if (response.errors) {
      for (const item of response.items) {
        console.log(item);
      }
    }
  }

  public async searchToDictionaryList(term: string, debug: boolean) {
    let whereList: any[] = [];
    const originalTerm = term;

    if (isChinese(term)) {
      whereList = [
        {
          type: 'term',
          field: 'ideogramKeyword',
          score: '90',
        },
        {
          type: 'match_phrase',
          field: 'ideogram',
          score: '78',
        },
      ];

      term = await ideogramsConverter.traditionalToSimplified(term);
    } else {
      whereList = [
        {
          type: 'term',
          field: 'pronunciationKeyword',
          score: '76',
        },
        {
          type: 'match_phrase',
          field: 'pronunciation',
          score: '74',
        },
        {
          type: 'term',
          field: 'pronunciationUnaccentedKeyword',
          score: '72',
        },
        {
          type: 'match_phrase',
          field: 'pronunciationUnaccented',
          score: '70',
        },
        {
          type: 'term',
          field: 'dictionary.ptKeyword',
          score: '30',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.pt',
          score: '20',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.ctPt',
          score: '19',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.glosbePt',
          score: '18',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.ctEs',
          score: '17',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.3LinesEs',
          score: '17',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.glosbeEs',
          score: '16',
        },
        {
          type: 'term',
          field: 'dictionary.cedictKeyword',
          score: '15',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.cedict',
          score: '14',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.ctEn',
          score: '12',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.3LinesEn',
          score: '12',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.glosbeEn',
          score: '11',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.unihan',
          score: '10',
        },
      ];
    }

    const scoreFormulaList = [
      '(_score * $score)',
      "doc['main'].value",
      "(doc['hskInverse'].value * 0.003)",
      "(doc['frequencyInverse'].value * 0.002)",
      "(doc['usage'].value * 0.0001)",
    ];

    const scoreFormula = scoreFormulaList.join(' + ');

    const whereShould: any[] = [];
    const scoreFunctions: any[] = [];
    const notScoreFilter: any[] = [];
    for (const where of whereList) {
      const searchContainer: any = {
        bool: {
          filter: [],
        },
      };
      const searchFilter: any = {};
      const searchCondition: any = {};
      searchCondition[where.field] = term;
      searchFilter[where.type] = searchCondition;
      searchContainer.bool.filter.push(searchFilter);
      whereShould.push(searchContainer);

      const scoreCondition: any = {};
      scoreCondition[where.field] = term;

      const scoreFilter: any = {};
      scoreFilter[where.type] = scoreCondition;

      scoreFunctions.push({
        filter: {
          bool: {
            must: scoreFilter,
            must_not: JSON.parse(JSON.stringify(notScoreFilter)),
          },
        },
        script_score: {
          script: {
            source: `${scoreFormula.replace('$score', where.score)}`,
          },
        },
      });

      notScoreFilter.push(scoreFilter);
    }

    const query = {
      function_score: {
        query: {
          bool: {
            must: [
              { match: { _index: this.getIndex() } },
              { match: { simplified: true } },
            ],

            should: whereShould,
            minimum_should_match: 1,
          },
        },
        functions: scoreFunctions,
      },
    };

    try {
      const response = await this.getClient().search({
        body: { size: 50, query },
      });
      if (debug) {
        return {
          response,
          query,
        };
      }

      const entries: any[] = await bluebird.map(
        response.hits.hits,
        async (item: any) => {
          const source: any = item._source;
          let variants = source.variants;
          if (!variants) {
            variants = [
              await ideogramsConverter.simplifiedToTraditional(source.ideogram),
            ];
          }

          return {
            id: source.id,
            pronunciation: source.pronunciation,
            ideogram: source.ideogram,
            variants,
            score: item._score,
          };
        },
        { concurrency: 10 },
      );

      return {
        entries,
        search: originalTerm,
      };
    } catch (e) {
      if (debug) {
        return {
          error: {
            message: e.message,
          },
          query,
        };
      }

      throw e;
    }
  }

  protected getIndex(): string {
    return 'pinyin';
  }

  protected getClient(): Client {
    if (client) {
      return client;
    }

    client = new Client({
      host: `${process.env['ELASTICSEARCH_HOST']}:${process.env['ELASTICSEARCH_PORT']}`,
      // log: 'trace',
    });

    return client;
  }
}
