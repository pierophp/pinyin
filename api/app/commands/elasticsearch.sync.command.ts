import { chunk } from 'lodash';
import { Argv, CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import * as CjkRepository from '../repository/CjkRepository';

export class ElasticsearchSyncCommand implements CommandModule {
  public command = 'elasticsearch:sync';
  public describe = 'Sync all indices on Elasticsearch';

  public async handler(argv: Argv) {
    const dictionary = await CjkRepository.findAll();
    const dictionaryChunkList = chunk(dictionary, 500);

    const provider = new ElasticsearchProvider();

    console.log('Syncing');

    for (const dictionaryList of dictionaryChunkList) {
      await provider.saveMany(dictionaryList);
    }

    //console.log(dictionaryChunkList);

    process.exit();
  }
}
