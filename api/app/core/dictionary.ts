import * as UnihanSearch from '../services/UnihanSearch';
import { ElasticsearchProvider } from './search/elasticsearch.provider';

export class Dictionary {
  public async search(term: string, debug: boolean) {
    const searchManager = new ElasticsearchProvider();
    return await searchManager.searchToDictionaryList(term, debug);
    // return await UnihanSearch.searchToDictionaryList(term);
  }
}
