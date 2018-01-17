const BaseRepository = require('./BaseRepository');
const knex = require('../../services/knex');

module.exports = class LanguageRepository extends BaseRepository {
  static async findOneByCode(code) {
    const response = await knex('language')
      // .transacting(await this.getTransaction())
      .where({ code });
    if (response.length > 0) {
      return response[0];
    }

    return null;
  }
};
