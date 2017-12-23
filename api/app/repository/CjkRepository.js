const BaseRepository = require('./BaseRepository');
const DatabaseCjkRepository = require('./database/CjkRepository');

module.exports = class CjkRepository extends BaseRepository {
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
};
