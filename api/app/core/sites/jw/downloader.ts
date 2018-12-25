import { http } from '../../../helpers/http';
import { profiler } from '../../../helpers/profiler';
import * as cheerio from 'cheerio';
import { Parser } from './parser';
import * as UnihanSearch from '../../../services/UnihanSearch';
import * as bluebird from 'bluebird';
import { orderBy } from 'lodash';
import { Encoder } from '../encoder';
import { Downloader as GenericDownloader } from '../downloader';

export class Downloader {
  public async download(
    url: string,
    language: string,
    ideogramType: string,
    convertPinyin: boolean = true,
  ) {
    const encoder = new Encoder();

    profiler(`Download JW Start - ${url}`);

    if (!ideogramType) {
      ideogramType = 's';
    }

    const chineseSites = [
      'https://www.jw.org/cmn-hans',
      'https://www.jw.org/cmn-hant',
    ];
    let isChinese = false;
    let isTraditional = false;
    let newLanguage: string = '';
    chineseSites.forEach(chineseSite => {
      if (url.substring(0, chineseSite.length) === chineseSite) {
        isChinese = true;
      }

      if (url.indexOf('jw.org/cmn-hant') !== -1) {
        isTraditional = true;
      }
    });

    const parser = new Parser();

    let response;
    const downloader = new GenericDownloader();

    try {
      response = await downloader.download(encoder.encodeUrl(url));
    } catch (e) {
      profiler('Download on exception: ' + url);
      response = await downloader.download(url);
    }

    profiler('Download JW End');

    try {
      response = JSON.parse(response);
      if (response.items[0].content) {
        response = '<div id="article">' + response.items[0].content + '</div>';
      }
    } catch (e) {}

    let $ = cheerio.load(response);
    if (!isChinese) {
      newLanguage = String(url.replace('https://www.jw.org/', '')).split(
        '/',
      )[0];

      if (ideogramType === 't') {
        isTraditional = true;
      }

      const downloader = new GenericDownloader();

      const chineseLink = $(`link[hreflang="cmn-han${ideogramType}"]`);
      if (chineseLink.length > 0) {
        const link = `https://www.jw.org${chineseLink.attr('href')}`;
        profiler(`Download JW Start - Chinese - ${encoder.encodeUrl(link)}`);
        try {
          response = await downloader.download(encoder.encodeUrl(link));
        } catch (e) {
          response = await downloader.download(link);
        }

        profiler('Download JW End - Chinese');
        $ = cheerio.load(response);
      }
    }

    profiler('Parse JW Start');

    const parsedDownload: any = await parser.parse($, true, isTraditional);

    if (language) {
      if (newLanguage) {
        language = newLanguage;
      }
      const translateLink = $(`link[hreflang="${language}"]`);
      if (translateLink.length > 0) {
        const link = `https://www.jw.org${translateLink.attr('href')}`;
        profiler('Download JW (Language) Start');
        response = await http.get(link);
        profiler('Parse JW (Language) Start');
        $ = cheerio.load(response.data);
        const parsedDownloadLanguage: any = await parser.parse(
          $,
          false,
          isTraditional,
        );

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
    }

    if (parsedDownload.links) {
      profiler('Getting links');
      const responseLinks: any = { links: [] };
      await bluebird.map(
        parsedDownload.links,
        async (l: any, i) => {
          if (!l.link) {
            return;
          }

          const jwLink = l.link.includes('https://www.jw.org')
            ? l.link
            : `https://www.jw.org${l.link}`;

          const linkResponse = await this.download(
            encoder.decodeUrl(jwLink),
            language,
            ideogramType,
            convertPinyin,
          );

          responseLinks.links.push({
            number: l.number,
            title: l.title,
            title_pinyin: l.title_pinyin,
            link: encoder.decodeUrl(jwLink),
            content: linkResponse,
          });
        },
        { concurrency: 4 },
      );

      responseLinks.links = orderBy(responseLinks.links, ['number']);

      return responseLinks;
    }

    if (convertPinyin) {
      profiler('Pinyin Start');

      await bluebird.map(
        parsedDownload.text,
        async (item: any, i) => {
          if (!item) {
            return;
          }

          if (item.type === 'img') {
            return;
          }

          if (item.type === 'box-img') {
            return;
          }

          if (!item.text) {
            item.text = '';
          }

          if (typeof item.text === 'string') {
            const ideograms = item.text.split(' ');
            const pinyin = await UnihanSearch.toPinyin(ideograms);
            const pinynReturn: any[] = [];
            pinyin.forEach(pinyinItem => {
              pinynReturn.push(pinyinItem.pinyin);
            });

            parsedDownload.text[i].pinyin = pinynReturn;
          }
        },
        { concurrency: 4 },
      );
    }

    profiler('End');

    return parsedDownload;
  }
}
