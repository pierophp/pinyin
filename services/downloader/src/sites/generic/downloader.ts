import { cheerio, bluebird } from '../../deps.ts';

import { PinyinConverter } from '../../pinyin/pinyin.converter.ts';
import { profiler } from '../../helpers/profiler.ts';
import { Encoder } from '../encoder.ts';
import { getBaseUrl } from '../helpers/get.base.url.ts';
import { Parser } from './parser.ts';
import { Downloader as GenericDownloader } from '../downloader.ts';
import { DownloaderInterface } from '../interfaces/downloader.interface.ts';

const pinyinConverter = new PinyinConverter();
export class Downloader implements DownloaderInterface {
  protected downloader: GenericDownloader;
  constructor() {
    this.downloader = new GenericDownloader();
  }

  public async download(
    url: string,
    _language: string,
    _ideogramType: string,
    convertPinyin = true,
  ) {
    const encoder = new Encoder();

    profiler(`Download Generic - ${encoder.encodeUrl(url)}`);

    const parser = new Parser();

    let response;

    try {
      response = await this.downloader.download(encoder.encodeUrl(url));
    } catch (e) {
      profiler('Download on exception: ' + url);
      response = await this.downloader.download(url);
    }

    profiler('Download Generic End');

    let $ = cheerio.load(response);

    const baseUrl = getBaseUrl(url);

    const parsedDownload: any = await parser.parse($, true, baseUrl);

    if (convertPinyin) {
      profiler('Pinyin Start');

      await bluebird.map(
        parsedDownload.text,
        async (item: any, i) => {
          if (item.type === 'img') {
            return;
          }

          if (item.type === 'box-img') {
            return;
          }

          if (!item.text) {
            item.text = '';
          }

          const ideograms = item.text.split(' ');
          const pinyin = await pinyinConverter.toPinyin(ideograms);
          const pinynReturn: any[] = [];
          pinyin.forEach((pinyinItem) => {
            pinynReturn.push(pinyinItem.pinyin);
          });

          parsedDownload.text[i].pinyin = pinynReturn;
        },
        { concurrency: 4 },
      );
    }

    profiler('End');

    return parsedDownload;
  }
}
