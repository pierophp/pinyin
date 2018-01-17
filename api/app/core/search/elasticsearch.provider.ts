import * as env from '../../../env';
import { Client } from 'elasticsearch';
import { IdeogramsConverter } from '../converter/ideograms.converter';
import * as isChinese from '../../../../shared/helpers/is-chinese';
import * as bluebird from 'bluebird';

let client;
const ideogramsConverter = new IdeogramsConverter();

export class ElasticsearchProvider {
  public async createStructure() {
    const type = this.getType();
    const mappings: any = {};

    mappings[type] = {
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
        'dictionary.pt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.ctPt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.ctEn': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.ctEs': { type: 'text', analyzer: 'analyzer_es' },
        'dictionary.glosbePt': { type: 'text', analyzer: 'analyzer_pt' },
        'dictionary.glosbeEn': { type: 'text', analyzer: 'analyzer_en' },
        'dictionary.glosbeEs': { type: 'text', analyzer: 'analyzer_es' },
        type: { type: 'keyword' },
        simplified: { type: 'boolean' },
        traditional: { type: 'boolean' },
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

    return {
      id: dictionary.id,
      ideogram: ideogramsConverter.convertUtf16ToIdeograms(dictionary.ideogram),
      pronunciation: dictionary.pronunciation,
      pronunciationUnaccented: dictionary.pronunciation_unaccented,
      ideogramKeyword: ideogramsConverter.convertUtf16ToIdeograms(
        dictionary.ideogram,
      ),
      pronunciationKeyword: dictionary.pronunciation,
      pronunciationUnaccentedKeyword: dictionary.pronunciation_unaccented,
      dictionary: {
        unihan: dictionary.definition_unihan,
        cedict: cedict ? cedict.join(' ||| ') : null,
        pt: pt ? pt.join(' ||| ') : null,
        ctPt: ctPt ? ctPt.join(' ||| ') : null,
        ctEn: ctEn ? ctEn.join(' ||| ') : null,
        ctEs: ctEs ? ctEs.join(' ||| ') : null,
        glosbePt: glosbePt ? glosbePt.join(' ||| ') : null,
        glosbeEn: glosbeEn ? glosbeEn.join(' ||| ') : null,
        glosbeEs: glosbeEs ? glosbeEs.join(' ||| ') : null,
      },
      type: dictionary.type,
      simplified: dictionary.simplified ? true : false,
      traditional: dictionary.traditional ? true : false,
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
          _type: this.getType(),
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
      type: this.getType(),
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

    if (isChinese(term)) {
      whereList = [
        {
          type: 'term',
          field: 'ideogramKeyword',
          score: '50',
        },
        {
          type: 'match_phrase',
          field: 'ideogram',
          score: '40',
        },
      ];
    } else {
      whereList = [
        {
          type: 'term',
          field: 'pronunciationKeyword',
          score: '38',
        },
        {
          type: 'match_phrase',
          field: 'pronunciation',
          score: '36',
        },
        {
          type: 'term',
          field: 'pronunciationUnaccentedKeyword',
          score: '34',
        },
        {
          type: 'match_phrase',
          field: 'pronunciationUnaccented',
          score: '32',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.pt',
          score: '20',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.ctPt',
          score: '18',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.glosbePt',
          score: '17',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.ctEs',
          score: '16',
        },
        {
          type: 'match_phrase',
          field: 'dictionary.glosbeEs',
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
      "(doc['hskInverse'].value * 0.03)",
      "(doc['frequencyInverse'].value * 0.02)",
      "(doc['usage'].value * 0.0001)",
    ];

    const scoreFormula = scoreFormulaList.join(' + ');

    const whereShould: any[] = [];
    const scoreFunctions: any[] = [];
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
        filter: scoreFilter,
        script_score: {
          script: {
            source: `Math.log(${scoreFormula.replace('$score', where.score)})`,
          },
        },
      });
    }

    const query = {
      function_score: {
        query: {
          bool: {
            must: [
              { match: { _index: this.getIndex() } },
              { match: { _type: this.getType() } },
              { match: { simplified: true } },
            ],

            should: whereShould,
            minimum_should_match: 1,
          },
        },
        functions: scoreFunctions,
      },
    };

    const response = await this.getClient().search({
      body: { query },
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
        return {
          id: source.id,
          pronunciation: source.pronunciation,
          ideogram: source.ideogram,
          ideogramTraditional: await ideogramsConverter.simplifiedToTraditional(
            source.ideogram,
          ),
        };
      },
      { concurrency: 10 },
    );

    return {
      entries,
      search: term,
    };
  }

  protected getIndex(): string {
    return 'pinyin';
  }

  protected getType(): string {
    return 'dictionary';
  }

  protected getClient(): Client {
    if (client) {
      return client;
    }

    client = new Client({
      host: `${env.elasticsearch_host}:${env.elasticsearch_port}`,
      // log: 'trace',
    });

    return client;
  }
}
