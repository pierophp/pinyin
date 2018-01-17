const BaseRepository = require('./BaseRepository');
const DatabaseLanguageRepository = require('./database/LanguageRepository');
const { ArrayCache } = require('../cache/array.cache');

module.exports = class LanguageRepository extends BaseRepository {
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
};
