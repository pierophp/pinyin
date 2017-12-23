const BaseRepository = require('./BaseRepository');
const DatabasePhraseRepository = require('./database/PhraseRepository');

module.exports = class PhraseRepository extends BaseRepository {
  static async save(phrase, skipUpdate) {
    await DatabasePhraseRepository.save(phrase, skipUpdate);
  }

  static async saveReference(phraseReference) {
    await DatabasePhraseRepository.saveReference(phraseReference);
  }

  static async findByLanguageAndRlike(language, rlike) {
    return await DatabasePhraseRepository.findByLanguageAndRlike(
      language,
      rlike,
    );
  }
};
