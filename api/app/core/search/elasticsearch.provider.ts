import * as env from '../../../env';
import { Client } from 'elasticsearch';

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
