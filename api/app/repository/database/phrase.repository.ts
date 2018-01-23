import { BaseRepository } from './base.repository';
import * as knex from '../../services/knex';

export class PhraseRepository extends BaseRepository {
  static async findOneByProviderAndProviderIdLanguageId(
    provider,
    providerId,
    languageId,
  ) {
    const connection = await this.getMysqlConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM phrase WHERE provider = ? AND provider_id = ? AND language_id = ?',
      [provider, providerId, languageId],
    );

    if (rows.length > 0) {
      return rows[0];
    }

    return null;
  }

  static async findOneByProviderAndProviderId(provider, providerId) {
    const response = await knex('phrase')
      // .transacting(await this.getTransaction())
      .where({
        provider,
        provider_id: providerId,
      });

    if (response.length > 0) {
      return response[0];
    }

    return null;
  }

  static async save(data, skipUpdate) {
    const phrase = await this.findOneByProviderAndProviderIdLanguageId(
      data.provider,
      data.provider_id,
      data.language_id,
    );

    if (!phrase) {
      await knex('phrase')
        //        .transacting(await this.getTransaction())
        .insert(data);
    } else if (!skipUpdate) {
      await knex('phrase')
        //        .transacting(await this.getTransaction())
        .where('id', '=', phrase.id)
        .update(data);
    }
  }

  static async saveReference(phraseReference) {
    const fromPhrase = await this.findOneByProviderAndProviderId(
      phraseReference.provider,
      phraseReference.fromId,
    );

    if (!fromPhrase) {
      return;
    }

    const toPhrase = await this.findOneByProviderAndProviderId(
      phraseReference.provider,
      phraseReference.toId,
    );

    if (!toPhrase) {
      return;
    }

    await knex('phrase_reference')
      //       .transacting(await this.getTransaction())
      .insert({
        from_phrase_id: fromPhrase.id,
        to_phrase_id: toPhrase.id,
      });
  }

  static async findByLanguageAndRlike(language, rlike) {
    return await knex('phrase')
      //    .transacting(await this.getTransaction())
      .whereRaw(`phrase LIKE "%${rlike}%" AND language_id = ${language.id}`)
      .limit(200)
      .select('id');
  }
}
