import { Argv, CommandModule } from 'yargs';
import * as CjkRepository from '../repository/CjkRepository';

export class ElasticsearchSyncCommand implements CommandModule {
  public command = 'elasticsearch:sync';
  public describe = 'Sync all indices on Elasticsearch';

  public async handler(argv: Argv) {
    const dictionary = await CjkRepository.findAll();
    console.log(dictionary);

    console.log('Syncing');
    process.exit();
  }
}
