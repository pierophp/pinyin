import * as isChinese from '../../../../../shared/helpers/is-chinese';
import * as replaceIdeogramsToSpace from '../../../../../shared/helpers/special-ideograms-chars';
import * as replaceall from 'replaceall';
import { orderBy, trimEnd } from 'lodash';
import * as knex from '../../../services/knex';
import * as UnihanSearch from '../../../services/UnihanSearch';

export class Frequency {
  public async getFrequency(response, url) {
    const words: any = {};
    if (response.text) {
      for (const t of response.text) {
        this.getFrequencyByText(t, words);
      }
    }

    if (response.links) {
      for (const link of response.links) {
        for (const t of link.content.text) {
          this.getFrequencyByText(t, words);
        }
      }
    }

    const wordsList: any[] = [];

    Object.keys(words).forEach(key => {
      wordsList.push({
        ideogram: key,
        total: words[key],
      });
    });

    const publicationCode = trimEnd(url, '/')
      .split('/')
      .pop();

    for (const word of wordsList) {
      const publicationFrequency = await knex('publication_frequency').where({
        code: publicationCode,
        ideogram: UnihanSearch.convertIdeogramsToUtf16(word.ideogram),
      });

      if (publicationFrequency.length) {
        continue;
      }

      await knex('publication_frequency').insert({
        code: publicationCode,
        ideogram: UnihanSearch.convertIdeogramsToUtf16(word.ideogram),
        total: word.total,
        created_at: new Date(),
      });
    }

    await knex.raw(`UPDATE (
      SELECT ideogram, SUM(total) total  
      FROM publication_frequency
      GROUP BY ideogram
    ) a
    JOIN cjk c ON c.ideogram = a.ideogram
    SET c.usage = a.total`);

    return orderBy(wordsList, ['total'], ['desc']);
  }

  protected getFrequencyByText(t, words) {
    if (!t.text) {
      return;
    }

    replaceIdeogramsToSpace.forEach(item => {
      t.text = replaceall(item, '', t.text);
    });

    if (!t.text) {
      return;
    }

    t.text.split(' ').forEach(part => {
      if (!isChinese(part)) {
        return;
      }

      if (!words[part]) {
        words[part] = 0;
      }

      words[part] += 1;

      for (const ideogram of part) {
        if (!words[ideogram]) {
          words[ideogram] = 0;
        }

        words[ideogram] += 1;
      }
    });
  }
}
