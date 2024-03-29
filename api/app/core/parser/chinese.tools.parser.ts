import axios from 'axios';
import * as cheerio from 'cheerio';
import * as querystring from 'querystring';
import * as replaceall from 'replaceall';

export class ChineseToolsParser {
  public async parse(word: string, pronunciation: string, language: string) {
    const urls = {
      pt:
        'http://www.chinese-tools.com/tools/chinese-portuguese-dictionary.html',
      es: 'http://www.chinese-tools.com/tools/chinese-spanish-dictionary.html',
      en: 'http://www.chinese-tools.com/tools/dictionary.html',
    };

    const response = await axios.post(
      urls[language],
      querystring.stringify({ dico: word }),
      { timeout: 2500 },
    );

    const $ = cheerio.load(response.data);
    let defaultResponse: string[] = [];
    let dictResponse: string[] = [];

    pronunciation = replaceall(' ', '', pronunciation).toLowerCase();

    $('.ctdico_entry').each((i, row) => {
      if (dictResponse.length > 0) {
        return;
      }

      let dictIdeogram = $(row)
        .find('.ctdico_char')
        .text();

      if (!dictIdeogram) {
        return;
      }

      dictIdeogram = dictIdeogram.trim();

      if (dictIdeogram !== word) {
        return;
      }

      let dictPinyin = $(row)
        .find('.ctdico_pinyin')
        .html()!
        .trim();

      let dictDef: string =
        $(row)
          .find('.ctdico_def')
          .html() || '';

      dictDef = replaceall('</a>', '</a> ', dictDef);
      dictDef = $('<textarea />')
        .html(dictDef!)
        .text();
      dictDef = replaceall(' ;', ';', dictDef);

      let dictDefList: string[] = dictDef!
        .split('\n')
        .map(item => item.trim())
        .filter(item => item);

      if (dictDefList.length === 1) {
        dictDefList = dictDefList[0]
          .split('/')
          .map(item => item.trim())
          .filter(item => item);
      }

      if (defaultResponse.length === 0) {
        defaultResponse = dictDefList;
      }

      dictPinyin = $('<textarea />')
        .html(dictPinyin)
        .text();

      const dictPinyinWithoutSpace = replaceall(
        ' ',
        '',
        dictPinyin,
      ).toLowerCase();

      if (dictPinyinWithoutSpace === pronunciation) {
        dictResponse = dictDefList;
      }
    });

    if (!dictResponse.length) {
      return defaultResponse;
    }

    return dictResponse;
  }
}
