import * as env from '../../../env';
import { DatabaseProvider } from '../search/database.provider';
import { ElasticsearchProvider } from '../search/elasticsearch.provider';

export class DictionaryManager {
  public async search(term: string, debug: boolean) {
    // if (env.elasticsearch_host) {
    //   const searchManager = new ElasticsearchProvider();
    //   return await searchManager.searchToDictionaryList(term, debug);
    // }

    const searchManager = new DatabaseProvider();
    return await searchManager.searchToDictionaryList(term);
  }
}
