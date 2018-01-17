import { chunk } from 'lodash';
import { Argv, CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';
import { CjkRepository } from '../repository/cjk.repository';

export class ElasticsearchSyncCommand implements CommandModule {
  public command = 'elasticsearch:sync';
  public describe = 'Sync all indices on Elasticsearch';

  public async handler(argv: Argv) {
    const dictionary = (await CjkRepository.findAll()).filter(item => {
      return item.type === 'W' || (item.type === 'C' && item.frequency < 999);
    });
    const dictionaryChunkList = chunk(dictionary, 500);

    const provider = new ElasticsearchProvider();

    console.log('Syncing');

    for (const dictionaryList of dictionaryChunkList) {
      await provider.saveMany(dictionaryList);
    }

    process.exit();
  }
}
