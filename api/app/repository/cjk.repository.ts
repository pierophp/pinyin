import { BaseRepository } from './base.repository';
import { CjkRepository as DatabaseCjkRepository } from './database/cjk.repository';

export class CjkRepository extends BaseRepository {
  static async findAll() {
    return DatabaseCjkRepository.findAll();
  }

  static async findChineseToolsNotNull(language): Promise<any[]> {
    return DatabaseCjkRepository.findChineseToolsNotNull(language);
  }

  static async findChineseToolsIsNull(language): Promise<any[]> {
    return DatabaseCjkRepository.findChineseToolsIsNull(language);
  }

  static async findGlosbeNotNull(language): Promise<any[]> {
    return DatabaseCjkRepository.findGlosbeNotNull(language);
  }

  static async findGlosbeIsNull(language): Promise<any[]> {
    return DatabaseCjkRepository.findGlosbeIsNull(language);
  }

  static async findIdeogramRawIsNull(): Promise<any[]> {
    return DatabaseCjkRepository.findIdeogramRawIsNull();
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
