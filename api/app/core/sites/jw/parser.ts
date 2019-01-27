import * as bluebird from 'bluebird';
import { BlockInterface } from '../../../core/interfaces/block.interface';
import { profiler } from '../../../helpers/profiler';
import { ParserResponseInterface } from '../interfaces/parser.response.interface';
import { TextInterface } from '../interfaces/text.interface';
import { ParseItemInterface } from './interfaces/parse.item.interface';
import { AudioParser } from './parser/audio.parser';
import { DomParser } from './parser/dom.parser';
import { PdfObjecyParser } from './parser/pdf.object.parser';
import { RubyParser } from './parser/ruby.parser';
import { SummaryParser } from './parser/summary.parser';
import { WithPdfParser } from './parser/with.pdf.parser';
import { WithoutPdfParser } from './parser/without.pdf.parser';

export class Parser {
  protected pdfParsedObjectPromise?: Promise<any>;
  protected baseUrl?: string;

  public async parse(
    $chinese: any,
    $language?: any,
    $simplified?: any,
    baseUrl?: string,
  ): Promise<ParserResponseInterface> {
    this.baseUrl = baseUrl;
    if (this.isSummary($chinese)) {
      const summaryParser = new SummaryParser();
      return await summaryParser.parse($chinese);
    }

    const pdfObjecyParser = new PdfObjecyParser();
    this.pdfParsedObjectPromise = pdfObjecyParser.parse(
      $simplified ? $simplified : $chinese,
    );

    const downloadResponse: ParserResponseInterface = {
      text: [],
    };

    const audioParser = new AudioParser();
    downloadResponse.audio = await audioParser.parse($chinese);

    const chineseDomParser = new DomParser(this.baseUrl);
    const chinesePromise = chineseDomParser.parse($chinese, true);

    const languageDomParser = new DomParser();
    let languagePromise = new Promise<TextInterface[]>(resolve => resolve([]));
    if ($language) {
      languagePromise = languageDomParser.parse($language, false);
    }

    const simplifiedDomParser = new DomParser();
    let simplifiedPromise = new Promise<TextInterface[]>(resolve =>
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
      async item => {
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
      return await rubyParser.parse(item);
    }

    if (this.pdfParsedObjectPromise) {
      const withPdfParser = new WithPdfParser();

      try {
        const parsedPdfResult = await withPdfParser.parse(
          item,
          this.pdfParsedObjectPromise,
        );

        if (parsedPdfResult) {
          return parsedPdfResult;
        }
      } catch (e) {
        console.error(
          `Error on WITH Pdf Parser \n${e.message} \nLine: ${JSON.stringify(
            item.chinese.text,
          )}`,
        );

        throw e;
      }
    }

    try {
      const withoutPdfParser = new WithoutPdfParser();
      return await withoutPdfParser.parse(item);
    } catch (e) {
      console.error(
        `Error on WITHOUT Pdf Parser \n${e.message} \nLine: ${JSON.stringify(
          item.chinese.text,
        )}`,
      );

      throw e;
    }
  }

  public async fillLanguage(parsedDownloadLanguage, parsedDownload) {
    if (!parsedDownloadLanguage) {
      return;
    }

    parsedDownloadLanguage.text.forEach((item, i) => {
      if (item.type === 'img') {
        return;
      }

      if (item.type === 'box-img') {
        return;
      }

      if (!parsedDownload.text[i]) {
        parsedDownload.text[i] = {};
      }

      parsedDownload.text[i].trans = item.text;
    });
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
