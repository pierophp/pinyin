import { BaseRepository } from './base.repository';
import { CjkRepository as DatabaseCjkRepository } from './database/cjk.repository';

export class CjkRepository extends BaseRepository {
  static async findAll() {
    return DatabaseCjkRepository.findAll();
  }

  static async searchPronunciationByWord(ideograms) {
    return DatabaseCjkRepository.searchPronunciationByWord(ideograms);
  }

  static async save(cjk) {
    return DatabaseCjkRepository.save(cjk);
  }

  static async referencePhrases() {
    return DatabaseCjkRepository.referencePhrases();
  }
}
