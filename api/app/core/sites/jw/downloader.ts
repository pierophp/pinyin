import { http } from '../../../helpers/http';
import * as profiler from '../../../helpers/profiler';
import cheerio from 'cheerio';
import { Parser } from './parser';
import * as UnihanSearch from '../../../services/UnihanSearch';
import * as bluebird from 'bluebird';

export class Downloader {
  public async download(url: string, language: string, ideogramType: string) {
    profiler(`Download JW Start - ${this.encodeUrl(url)}`);

    if (!ideogramType) {
      ideogramType = 's';
    }

    const chineseSites = [
      'https://www.jw.org/cmn-hans',
      'https://www.jw.org/cmn-hant',
    ];
    let isChinese = false;
    let newLanguage: string = '';
    chineseSites.forEach((chineseSite) => {
      if (url.substring(0, chineseSite.length) === chineseSite) {
        isChinese = true;
      }
    });

    const parser = new Parser();

    let response;

    try {
      response = await http.get(this.encodeUrl(url));
    } catch (e) {
      profiler('Download on exception: ' + url);
      response = await http.get(url);
    }

    profiler('Download JW End');
    let $ = cheerio.load(response.data);
    if (!isChinese) {
      newLanguage = String(url.replace('https://www.jw.org/', '')).split('/')[0];

      const chineseLink = $(`link[hreflang="cmn-han${ideogramType}"]`);
      if (chineseLink.length > 0) {
        const link = `https://www.jw.org${chineseLink.attr('href')}`;
        profiler(`Download JW Start - Chinese - ${this.encodeUrl(link)}`);
        try {
          response = await http.get(this.encodeUrl(link));
        } catch (e) {
          if (e.response.status === 404) {
            response = await http.get(link);
          } else {
            throw e;
          }
        }

        profiler('Download JW End - Chinese');
        $ = cheerio.load(response.data);
      }
    }

    profiler('Parse JW Start');

    const parsedDownload: any = await parser.parse($, true);

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
        const parsedDownloadLanguage: any = await parser.parse($, false);
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
    profiler('Pinyin Start');
    await bluebird.map(parsedDownload.text, async (item, i) => {
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
      pinyin.forEach((pinyinItem) => {
        pinynReturn.push(pinyinItem.pinyin);
      });

      parsedDownload.text[i].pinyin = pinynReturn;
    }, { concurrency: 4 });

    profiler('End');

    return parsedDownload;
    }

    protected encodeUrl(url: string) {
      let newUrl = 'https://www.jw.org/';
      if (url.substr(0, newUrl.length) !== newUrl) {
        return url;
      }
  
      const urlParts = url.replace(newUrl, '').split('/');
      urlParts.forEach((urlPart) => {
        newUrl += encodeURIComponent(urlPart);
        newUrl += '/';
      });
      return newUrl;
    }
}