import { Argv, CommandModule } from 'yargs';

import { ElasticsearchProvider } from '../core/search/elasticsearch.provider';

export class ElasticsearchStructureCommand implements CommandModule {
  public command = 'elasticsearch:structure';
  public describe = 'Sync all indices on Elasticsearch';

  public async handler(argv: Argv) {
    const provider = new ElasticsearchProvider();
    await provider.createStructure();
    process.exit();
  }
}
