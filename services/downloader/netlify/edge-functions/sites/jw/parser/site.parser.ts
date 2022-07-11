import * as backHtmlTags from 'pdf-pinyin/src/core/pinyin/back.html.tags';
import * as fillBoldItalic from 'pdf-pinyin/src/core/pinyin/fill.bold.italic';
import * as replaceall from 'replaceall';
import * as striptags from 'striptags';
import * as isChinese from '../../../../helpers/is-chinese';
import * as separatePinyinInSyllables from '../../../../helpers/separate-pinyin-in-syllables';
import * as replaceIdeogramsToSpace from '../../../../helpers/special-ideograms-chars';
import { BlockInterface } from '../../../../core/interfaces/block.interface';
import { PinyinConverter } from '../../../../core/pinyin/pinyin.converter';
import { replaceWords } from '../../../../core/sites/helpers/replace.words';
import { segmentText } from '../../../../core/sites/helpers/segment.text';
import { parseBible } from '../helpers/parse.bible';
import { ParseItemInterface } from '../interfaces/parse.item.interface';

const pinyinConverter = new PinyinConverter();
export class SiteParser {
  public async parse(item: ParseItemInterface): Promise<BlockInterface[]> {
    const text = item.chinese.text!;

    const numberRegex = new RegExp('^[0-9]+$');

    let lineText = '';
    const lineWithoutTags = striptags(text);
    lineText = await segmentText(lineWithoutTags);

    const specialWord = 'JOIN_SPECIAL';

    // separate by numbers
    lineText = lineText
      .split(/(\d+)/)
      .map((item) => {
        if (numberRegex.test(item)) {
          item = ` ${item}${specialWord} `;
        }
        return item;
      })
      .join('');

    replaceIdeogramsToSpace.forEach((item) => {
      lineText = replaceall(item, ` ${item}${specialWord} `, lineText);
    });

    // remove double spaces
    if (lineText) {
      lineText = lineText.replace(/\s{2,}/g, ' ').trim();
    }

    const ideograms = lineText.split(' ');
    const ideogramsFiltered: any[] = [];

    let joinSpecial = '';

    ideograms.forEach((ideogram) => {
      if (ideogram === specialWord) {
        return;
      }

      if (
        ideogram.substring(ideogram.length - specialWord.length) === specialWord
      ) {
        joinSpecial += ideogram.replace(specialWord, '');
        return;
      } else if (joinSpecial) {
        ideogramsFiltered.push(joinSpecial);
        joinSpecial = '';
      }

      ideogramsFiltered.push(ideogram);
    });

    if (joinSpecial) {
      ideogramsFiltered.push(joinSpecial);
    }

    lineText = ` ${ideogramsFiltered.join(' ')} `;
    lineText = replaceWords(lineText);

    let response: any[] = lineText
      .split(' ')
      .filter((item) => item)
      .map((item) => {
        return {
          c: item.split(''),
          p: [],
        };
      });

    response = backHtmlTags(response, text);

    response = fillBoldItalic(text, response);

    if (response.length > 0) {
      response[0].line = {
        type: item.chinese.type,
        pinyin_source: 'no_pdf',
      };
    }

    let bible;
    for (let item of response) {
      item.c = item.c.join('');
      item.p = '';

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

      delete item.tagsStart;
      delete item.tagsEnd;
    }

    return await this.pinyin(response);
  }

  public async pinyin(blocks: BlockInterface[]): Promise<BlockInterface[]> {
    let text = '';
    for (const block of blocks) {
      text += block.c + ' ';
    }

    text = text.trim();

    const pinyinList = await pinyinConverter.toPinyin(text.split(' '));
    let i = 0;
    for (const pinyinReturn of pinyinList) {
      if (blocks[i]) {
        blocks[i].p = separatePinyinInSyllables(pinyinReturn.pinyin).join(
          String.fromCharCode(160),
        );
      } else {
        console.error('Error on block', blocks);
      }
      i++;
    }

    return blocks;
  }
}
