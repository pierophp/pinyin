import { BaseRepository } from './base.repository';
import * as knex from '../../services/knex';

export class LanguageRepository extends BaseRepository {
  static async findOneByCode(code) {
    const response = await knex('language')
      // .transacting(await this.getTransaction())
      .where({ code });
    if (response.length > 0) {
      return response[0];
    }

    return null;
  }
}
