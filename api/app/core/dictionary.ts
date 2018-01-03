import * as UnihanSearch from '../services/UnihanSearch';
import { ElasticsearchProvider } from './search/elasticsearch.provider';

export class Dictionary {
  public async search(term) {
    const searchManager = new ElasticsearchProvider();
    return await searchManager.searchToDictionaryList(term);
    // return await UnihanSearch.searchToDictionaryList(term);
  }
}
