import { http } from '../../../helpers/http';
import { profiler } from '../../../helpers/profiler';
import * as cheerio from 'cheerio';
import { Parser } from './parser';
import * as UnihanSearch from '../../../services/UnihanSearch';
import * as bluebird from 'bluebird';
import { Curl } from 'node-libcurl';
import { Encoder } from '../encoder';

export class Downloader {
  public async download(
    url: string,
    language: string,
    ideogramType: string,
    convertPinyin: boolean = true,
  ) {
    const encoder = new Encoder();

    profiler(`Download Generic - ${encoder.encodeUrl(url)}`);

    const parser = new Parser();

    let response;

    try {
      response = await this.downloadUrl(encoder.encodeUrl(url));
    } catch (e) {
      profiler('Download on exception: ' + url);
      response = await this.downloadUrl(url);
    }

    profiler('Download Generic End');

    let $ = cheerio.load(response);

    const parsedDownload: any = await parser.parse($, true);

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
          const pinyin = await UnihanSearch.toPinyin(ideograms);
          const pinynReturn: any[] = [];
          pinyin.forEach(pinyinItem => {
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

  protected async downloadUrl(url: string) {
    const curl = new Curl();
    curl.setOpt('URL', url);
    curl.setOpt('FOLLOWLOCATION', true);
    return new Promise((done, reject) => {
      curl.on('end', (statusCode, body, headers) => {
        if (statusCode > 400) {
          reject();
          return;
        }

        curl.close.bind(curl);
        done(body);
      });

      curl.on('error', () => {
        curl.close.bind(curl);
        reject();
      });
      curl.perform();
    });
  }
}
