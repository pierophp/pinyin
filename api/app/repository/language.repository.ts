import { BaseRepository } from './base.repository';
import { LanguageRepository as DatabaseLanguageRepository } from './database/language.repository';
import { ArrayCache } from '../cache/array.cache';

export class LanguageRepository extends BaseRepository {
  static async findOneByCode(code) {
    const cacheKey = `LANGUAGE_${code}`;
    let language = await ArrayCache.get(cacheKey);
    if (language) {
      return language;
    }

    language = await DatabaseLanguageRepository.findOneByCode(code);
    await ArrayCache.set(cacheKey, language);
    return language;
  }
}
