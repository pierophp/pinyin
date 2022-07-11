import { IdeogramsConverter } from '../converter/ideograms.converter';
import * as isChinese from '../../helpers/is-chinese';
import * as bluebird from 'bluebird';
import { uniqBy } from 'lodash';
import * as replaceall from 'replaceall';
import * as knex from '../../services/knex';

const ideogramsConverter = new IdeogramsConverter();

export class DatabaseProvider {
  public async searchToDictionaryList(search: string) {
    search = replaceall(' ', '', search);
    let cjkList: any[] = [];

    if (isChinese(search)) {
      const simplifiedIdeogram =
        await ideogramsConverter.traditionalToSimplified(search);

      cjkList = await knex('cjk')
        .where({
          ideogram:
            ideogramsConverter.convertIdeogramsToUtf16(simplifiedIdeogram),
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation', 'ideogram');

      const cjkListLike = await knex('cjk')
        .where(
          'ideogram',
          'LIKE',
          `${ideogramsConverter.convertIdeogramsToUtf16(simplifiedIdeogram)}%`,
        )
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .orderBy('ideogram_length', 'ASC')
        .limit(100)
        .select(
          knex.raw(
            'id, pronunciation, ideogram, LENGTH(ideogram) ideogram_length',
          ),
        );

      // @ts-ignore
      cjkList = uniqBy([].concat(cjkList, cjkListLike), 'id');
    } else {
      cjkList = await knex('cjk')
        .where({
          pronunciation_unaccented: search,
        })
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id', 'pronunciation', 'ideogram');

      const cjkListLike = await knex('cjk')
        .where('pronunciation_unaccented', 'LIKE', `${search}%`)
        .orderBy('main', 'DESC')
        .orderBy('frequency', 'ASC')
        .orderBy('hsk', 'ASC')
        .orderBy('usage', 'DESC')
        .orderBy('ideogram_length', 'ASC')
        .limit(100)
        .select(
          knex.raw(
            'id, pronunciation, ideogram, LENGTH(ideogram) ideogram_length',
          ),
        );

      // @ts-ignore
      cjkList = uniqBy([].concat(cjkList, cjkListLike), 'id');
    }

    await bluebird.mapSeries(cjkList, async (entry) => {
      entry.ideogram = ideogramsConverter.convertUtf16ToIdeograms(
        entry.ideogram,
      );
      entry.ideogramTraditional =
        await ideogramsConverter.simplifiedToTraditional(entry.ideogram);
      return entry;
    });

    return { search, entries: cjkList };
  }
}
