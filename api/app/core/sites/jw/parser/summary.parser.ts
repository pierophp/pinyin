import { padStart } from 'lodash';
import * as isChinese from '../../../../helpers/is-chinese';
import * as separatePinyinInSyllables from '../../../../helpers/separate-pinyin-in-syllables';
import { ParserResponseInterface } from '../../../../core/sites/interfaces/parser.response.interface';

import { PinyinConverter } from '../../../../core/pinyin/pinyin.converter';
const pinyinConverter = new PinyinConverter();
export class SummaryParser {
  public async parse($: any): Promise<ParserResponseInterface> {
    const downloadResponse: ParserResponseInterface = { text: [] };
    downloadResponse.links = [];

    let items = $('.synopsis .syn-body');
    if (items.length === 0) {
      items = $('.musicList');
    }

    const itemsList: any[] = [];
    items.each((i, item) => {
      itemsList.push(item);
    });

    let i = 0;
    for (const item of itemsList) {
      i += 1;

      let link = $(item).find('h2 a');
      if (link.length === 0) {
        link = $(item).find('.fileTitle a');
      }

      const subtitle = $(item).find('.contextTitle');

      let title = '';
      title = $(link).text();

      if (subtitle.length) {
        title = $(subtitle).text() + ' - ' + title;
      }

      downloadResponse.links.push({
        link: $(link).attr('href'),
        number: padStart(String(i), 3, '0'),
        title,
        title_pinyin: (await pinyinConverter.toPinyin(title.split(' ')))
          .map((item) => {
            if (!isChinese(item.ideogram)) {
              return item.pinyin.split('').join(String.fromCharCode(160));
            }

            const pinyinSeparated = separatePinyinInSyllables(item.pinyin);

            return pinyinSeparated.join(String.fromCharCode(160));
          })
          .join(String.fromCharCode(160)),
      });
    }

    return downloadResponse;
  }
}
