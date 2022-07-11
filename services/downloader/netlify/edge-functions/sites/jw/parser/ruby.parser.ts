import * as backHtmlTags from 'pdf-pinyin/src/core/pinyin/back.html.tags';
import * as fillBoldItalic from 'pdf-pinyin/src/core/pinyin/fill.bold.italic';
import * as striptags from 'striptags';
import * as isChinese from '../../../../helpers/is-chinese';
import { BlockInterface } from '../../../../core/interfaces/block.interface';
import * as replaceall from 'replaceall';
import { parseBible } from '../helpers/parse.bible';
import { removeSpaces } from '../../../../helpers/remove.spaces';
import { ParseItemInterface } from '../interfaces/parse.item.interface';
import * as separatePinyinInSyllables from '../../../../helpers/separate-pinyin-in-syllables';
import { restoreTraditional } from '../helpers/restore.traditional';

export class RubyParser {
  public async parse(
    item: ParseItemInterface,
    parseSimplified: boolean,
  ): Promise<BlockInterface[] | undefined> {
    let text = item.chinese.text!;
    if (parseSimplified) {
      text = item.simplified!.text!;
    }

    if (parseSimplified) {
      let traditionalToCompare = item.chinese.text!;
      let simplifiedToCompare = item.simplified!.text!;

      traditionalToCompare = striptags(traditionalToCompare).replace(/ /g, '');

      simplifiedToCompare = striptags(
        simplifiedToCompare
          .replace(/<rt>(.*?)<\/rt>/g, '')
          .replace(/<ruby>/g, '')
          .replace(/<\/ruby>/g, ''),
      ).replace(/ /g, '');

      if (traditionalToCompare.length !== simplifiedToCompare.length) {
        console.info('RUBY - SIMPLIFIED AND TRADITIONAL NOT EQUALS');
        console.info('TRADITIONAL', traditionalToCompare);
        console.info('SIMPLIFIED', simplifiedToCompare);
        return;
      }
    }

    const blocks = text.split(/<ruby>|<\/ruby>/).filter((item) => item.trim());

    let items: any[] = [];

    for (let block of blocks) {
      const rtMatch = block.match(/<rt>(.*)<\/rt>/);

      let pinyin = [];
      if (rtMatch) {
        block = replaceall(rtMatch[0], '', block);
        pinyin = separatePinyinInSyllables(striptags(rtMatch[1]));
      }

      block = removeSpaces(striptags(block));

      if (!block) {
        continue;
      }

      items.push({
        c: block.split(''),
        p: pinyin,
      });
    }

    items = backHtmlTags(items, text);

    items = fillBoldItalic(text, items);

    if (items.length > 0) {
      items[0].line = {
        type: item.chinese.type,
        pinyinSpaced: 1,
        pinyin_source: 'ruby',
      };
    }

    let bible;
    let response: any[] = [];
    for (let item of items) {
      item.c = item.c.join('').trim();
      item.p = item.p.join(String.fromCharCode(160));

      if (!item.c) {
        continue;
      }

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

      let indexOfFootnote = -1;

      if (item.tagsStart) {
        indexOfFootnote = item.tagsStart.indexOf('<footnote');
      }

      if (indexOfFootnote >= 0) {
        const footnote = item.tagsStart.match(/\<footnote id="(.*?)"\>/);

        if (footnote) {
          item.footnote = footnote[1];
        }
      }

      delete item.tagsStart;
      delete item.tagsEnd;

      response.push(item);
    }

    if (parseSimplified) {
      return restoreTraditional(item.chinese.text!, response);
    }

    return response;
  }
}
