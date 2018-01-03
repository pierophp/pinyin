import * as env from '../../../env';
import { Client } from 'elasticsearch';
import { convertUtf16ToIdeograms } from '../../services/UnihanSearch';
let client;

export class ElasticsearchProvider {
  public async createStructure() {
    const type = this.getType();
    const mappings: any = {};
    mappings[type] = {
      properties: {
        id: { type: 'integer' },
        ideogram: { type: 'text' },
        pronunciation: { type: 'text' },
        pronunciationUnaccented: { type: 'text' },
        'dictionary.unihan': { type: 'text' },
        'dictionary.cedict': { type: 'text' },
        'dictionary.pt': { type: 'text' },
        'dictionary.ctPt': { type: 'text' },
        'dictionary.ctEn': { type: 'text' },
        'dictionary.ctEs': { type: 'text' },
        type: { type: 'keyword' },
        simplified: { type: 'boolean' },
        traditional: { type: 'boolean' },
        main: { type: 'boolean' },
        usage: { type: 'integer' },
        hsk: { type: 'integer' },
        createdAt: {
          type: 'date',
          format: 'strict_date_optional_time||epoch_millis',
        },
        updatedAt: {
          type: 'date',
          format: 'strict_date_optional_time||epoch_millis',
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
        mappings,
      },
    });
  }

  protected async getUpdateDocument(dictionary: any): Promise<any> {
    return {
      id: dictionary.id,
      ideogram: convertUtf16ToIdeograms(dictionary.ideogram), // @todo Convert
      pronunciation: dictionary.pronunciation,
      pronunciationUnaccented: dictionary.pronunciation_unaccented,
      dictionary: {
        unihan: dictionary.definition_unihan,
        cedict: dictionary.definition_cedict,
        pt: dictionary.definition_pt,
        ctPt: dictionary.definition_ct_pt,
        ctEn: dictionary.definition_ct_en,
        ctEs: dictionary.definition_ct_es,
      },
      type: dictionary.type,
      simplified: dictionary.simplified ? true : false,
      traditional: dictionary.traditional ? true : false,
      main: dictionary.main ? true : false,
      usage: dictionary.usage,
      hsk: dictionary.hsk,
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

  public async searchToDictionaryListBKP2(term: string) {
    const response = await this.getClient().search({
      body: {
        query: {
          function_score: {
            query: {
              bool: {
                must: [
                  { match: { _index: this.getIndex() } },
                  { match: { _type: this.getType() } },
                ],
              },
            },
            boost: '5',
            functions: [
              {
                filter: { term: { ideogram: term } },
                random_score: {},
                weight: 42,
              },
              // {
              //   filter: { match_phrase: { ideogram: term } },
              //   random_score: {},
              //   weight: 40,
              // },
              // {
              //   filter: { match: { ideogram: term } },
              //   random_score: {},
              //   weight: 38,
              // },
              // {
              //   filter: { match: { pronunciationUnaccented: term } },
              //   weight: 35,
              // },
              // {
              //   filter: { match: { pronunciation: term } },
              //   weight: 30,
              // },
            ],
            max_boost: 42,
            score_mode: 'max',
            boost_mode: 'multiply',
            min_score: 42,
          },
        },
      },
    });

    return response.hits;
  }

  public async searchToDictionaryList(term: string) {
    const response = await this.getClient().search({
      body: {
        query: {
          bool: {
            must: [
              { match: { _index: this.getIndex() } },
              { match: { _type: this.getType() } },
            ],
            should: [
              {
                bool: {
                  filter: [
                    {
                      term: {
                        ideogram: {
                          value: term,
                          boost: 10.0,
                        },
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  filter: [
                    {
                      match: {
                        ideogram: term,
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  filter: [
                    {
                      match: {
                        pronunciation: term,
                      },
                    },
                  ],
                },
              },
              {
                bool: {
                  filter: [
                    {
                      match: {
                        pronunciationUnaccented: term,
                      },
                    },
                  ],
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    });

    return response;
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
