import { BlockInterface } from '../../interfaces/block.interface.ts';
import { profiler } from '../../helpers/profiler.ts';
import { ParserResponseInterface } from '../interfaces/parser.response.interface.ts';
import { TextInterface } from '../interfaces/text.interface.ts';
import { ParseItemInterface } from './interfaces/parse.item.interface.ts';
import { AudioParser } from './parser/audio.parser.ts';
import { DomParser } from './parser/dom.parser.ts';

import { RubyParser } from './parser/ruby.parser.ts';
import { SummaryParser } from './parser/summary.parser.ts';
import { SiteParser } from './parser/site.parser.ts';
import { bluebird, CheerioAPI } from '../../deps.ts';

export class Parser {
  protected baseUrl?: string;

  public async parse(
    $chinese: CheerioAPI,
    $language?: CheerioAPI,
    $simplified?: CheerioAPI,
    baseUrl?: string,
    chineseUrl?: string,
  ): Promise<ParserResponseInterface> {
    this.baseUrl = baseUrl;
    // List of articles to upload publications as a whole
    if (this.isSummary($chinese)) {
      const summaryParser = new SummaryParser();
      return await summaryParser.parse($chinese);
    }
    const downloadResponse: ParserResponseInterface = {
      text: [],
    };

    const audioParser = new AudioParser();
    downloadResponse.audio = await audioParser.parse($chinese, chineseUrl!);

    const chineseDomParser = new DomParser(this.baseUrl);
    const chinesePromise = chineseDomParser.parse($chinese, true);

    const languageDomParser = new DomParser(this.baseUrl);
    let languagePromise = new Promise<TextInterface[]>((resolve) =>
      resolve([]),
    );
    if ($language) {
      languagePromise = languageDomParser.parse($language, false);
    }

    const simplifiedDomParser = new DomParser(this.baseUrl);
    let simplifiedPromise = new Promise<TextInterface[]>((resolve) =>
      resolve([]),
    );

    if ($simplified) {
      simplifiedPromise = simplifiedDomParser.parse($simplified, true);
    }

    profiler('Start Dom Promises');

    const items = await this.joinLanguages(
      chinesePromise,
      languagePromise,
      simplifiedPromise,
    );

    profiler('End Dom Promises');

    downloadResponse.text = await bluebird.map(
      items,
      async (item) => {
        return await this.parseItem(item);
      },
      { concurrency: 10 },
    );

    profiler('Parse End');

    if (
      downloadResponse.text[0] &&
      downloadResponse.text[0][0] &&
      downloadResponse.text[0][0].line
    ) {
      downloadResponse.text[0][0].line.pinyinSpaced = 1;
    }

    return downloadResponse;
  }

  protected async parseItem(
    item: ParseItemInterface,
  ): Promise<BlockInterface[]> {
    if (['img', 'box-img'].includes(item.chinese.type || '')) {
      return [
        {
          line: {
            type: item.chinese.type,
          },
          c: '',
          p: '',
          large: item.chinese.large,
          small: item.chinese.small,
        },
      ];
    }

    if (item.chinese.text && item.chinese.text.indexOf('<ruby>') !== -1) {
      const rubyParser = new RubyParser();
      const response = await rubyParser.parse(item, false);
      if (response) {
        return await this.fillLanguage(response, item);
      }
    }

    if (
      item.simplified &&
      item.simplified.text &&
      item.simplified.text.indexOf('<ruby>') !== -1
    ) {
      const rubyParser = new RubyParser();
      const response = await rubyParser.parse(item, true);
      if (response) {
        return await this.fillLanguage(response, item);
      }
    }

    try {
      const withoutPdfParser = new SiteParser();
      return await this.fillLanguage(await withoutPdfParser.parse(item), item);
    } catch (e) {
      console.error(
        `Error on WITHOUT Pdf Parser \n${e.message} \nLine: ${JSON.stringify(
          item.chinese.text,
        )}`,
      );
      console.error(e);

      throw e;
    }
  }

  public async fillLanguage(
    response: BlockInterface[],
    item: ParseItemInterface,
  ): Promise<BlockInterface[]> {
    if (response[0] && item.language) {
      response[0].trans = item.language.text;
    }

    return response;
  }

  protected async joinLanguages(
    chinesePromise: Promise<TextInterface[]>,
    languagePromise: Promise<TextInterface[]>,
    simplifiedPromise: Promise<TextInterface[]>,
  ): Promise<ParseItemInterface[]> {
    const response = await Promise.all([
      chinesePromise,
      languagePromise,
      simplifiedPromise,
    ]);

    const parsedDownload: TextInterface[] = response[0];
    const parsedDownloadLanguage: TextInterface[] = response[1];
    const parsedDownloadSimplified: TextInterface[] = response[2];

    const items: ParseItemInterface[] = [];

    let i = 0;
    for (const parsedItem of parsedDownload) {
      const item: ParseItemInterface = {
        chinese: parsedItem,
      };

      if (parsedDownloadLanguage[i]) {
        item.language = parsedDownloadLanguage[i];
      }

      if (parsedDownloadSimplified && parsedDownloadSimplified[i]) {
        item.simplified = parsedDownloadSimplified[i];
      }

      items.push(item);
      i++;
    }

    return items;
  }

  protected isSummary($: any): boolean {
    return (
      ($('.toc').length > 0 && $('article .docSubContent').length === 0) ||
      $('#musicTOC').length > 0
    );
  }
}
