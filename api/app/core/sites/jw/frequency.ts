import { orderBy, trimEnd } from 'lodash';
import * as replaceall from 'replaceall';
import * as isChinese from '../../../helpers/is-chinese';
import * as replaceIdeogramsToSpace from '../../../helpers/special-ideograms-chars';
import { IdeogramsConverter } from '../../../core/converter/ideograms.converter';
import * as knex from '../../../services/knex';

const ideogramConverter = new IdeogramsConverter();
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
        if (!link.content.text) {
          console.log('content not found for line ', link);
        }

        for (const t of link.content.text) {
          this.getFrequencyByText(t, words);
        }
      }
    }

    const wordsList: any[] = [];

    Object.keys(words).forEach((key) => {
      wordsList.push({
        ideogram: key,
        total: words[key],
      });
    });

    const publicationCode = trimEnd(url, '/').split('/').pop();

    for (const word of wordsList) {
      const publicationFrequency = await knex('publication_frequency').where({
        code: publicationCode,
        ideogram: ideogramConverter.convertIdeogramsToUtf16(word.ideogram),
      });

      if (publicationFrequency.length) {
        continue;
      }

      await knex('publication_frequency').insert({
        code: publicationCode,
        ideogram: ideogramConverter.convertIdeogramsToUtf16(word.ideogram),
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

    replaceIdeogramsToSpace.forEach((item) => {
      t.text = replaceall(item, '', t.text);
    });

    if (!t.text) {
      return;
    }

    t.text.split(' ').forEach((part) => {
      if (!isChinese(part)) {
        return;
      }

      if (!words[part]) {
        words[part] = 0;
      }

      words[part] += 1;

      if (part.length === 1) {
        return;
      }

      for (const ideogram of part) {
        if (!words[ideogram]) {
          words[ideogram] = 0;
        }

        words[ideogram] += 1;
      }
    });
  }
}
