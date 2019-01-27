import * as backHtmlTags from 'pdf-pinyin/src/core/pinyin/back.html.tags';
import * as fillBoldItalic from 'pdf-pinyin/src/core/pinyin/fill.bold.italic';
import * as striptags from 'striptags';
import * as isChinese from '../../../../../../shared/helpers/is-chinese';
import { BlockInterface } from '../../../../core/interfaces/block.interface';
import * as replaceall from 'replaceall';
import { parseBible } from '../helpers/parse.bible';
import { ParseItemInterface } from '../interfaces/parse.item.interface';
import * as separatePinyinInSyllables from '../../../../../../shared/helpers/separate-pinyin-in-syllables';

export class RubyParser {
  public async parse(item: ParseItemInterface): Promise<BlockInterface[]> {
    const text = item.chinese.text!;

    const blocks = text.split(/<ruby>|<\/ruby>/).filter(item => item.trim());

    let response: any[] = [];

    for (let block of blocks) {
      const rtMatch = block.match(/<rt>(.*)<\/rt>/);

      let pinyin = [];
      if (rtMatch) {
        block = replaceall(rtMatch[0], '', block);
        pinyin = separatePinyinInSyllables(striptags(rtMatch[1]));
      }

      block = striptags(block);

      response.push({
        c: block.split(''),
        p: pinyin,
      });
    }

    response = backHtmlTags(response, text);

    response = fillBoldItalic(text, response);

    if (response.length > 0) {
      response[0].line = {
        type: item.chinese.type,
        pinyin_source: 'ruby',
      };
    }

    let bible;
    for (let item of response) {
      delete item.tagsStart;
      delete item.tagsEnd;

      item.c = item.c.join('');
      item.p = item.p.join(String.fromCharCode(160));

      if (item.isBold) {
        item.isBold = 1;
      }

      if (item.isItalic) {
        item.isItalic = 1;
      }

      // @ts-ignore
      const tempBible = parseBible(item.tagsStart);
      if (tempBible) {
        bible = tempBible;
      }

      if (bible && !isChinese(item.c, true)) {
        item.b = bible;
        bible = null;
      }
    }

    return response;
  }
}
