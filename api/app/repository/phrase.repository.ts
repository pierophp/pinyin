import { BaseRepository } from './base.repository';
import { PhraseRepository as DatabasePhraseRepository } from './database/phrase.repository';

export class PhraseRepository extends BaseRepository {
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
}
