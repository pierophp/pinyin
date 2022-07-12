import { createRequire } from 'https://deno.land/std/node/module.ts';

import { cheerio } from 'https://deno.land/x/cheerio@1.0.6/mod.ts';
import orderBy from 'http://deno.land/x/lodash@4.17.15-es/orderBy.js';

const require = createRequire(import.meta.url);
const bluebird = require('bluebird');

import { profiler } from '../../helpers/profiler.ts';
import { Downloader as GenericDownloader } from '../downloader.ts';
import { Encoder } from '../encoder.ts';
import { getBaseUrl } from '../helpers/get.base.url.ts';
import { Parser } from './parser.ts';
import { Wol } from './wol.ts';
import { DownloaderInterface } from '../interfaces/downloader.interface.ts';

export class Downloader implements DownloaderInterface {
  protected downloader: GenericDownloader;
  protected encoder: Encoder;
  protected isChinese = false;
  protected isTraditional = false;
  protected chineseLink: string | null = null;
  constructor() {
    this.downloader = new GenericDownloader();
    this.encoder = new Encoder();
  }

  public async download(
    url: string,
    language?: string,
    ideogramType?: string,
    convertPinyin = true,
  ) {
    if (!ideogramType) {
      ideogramType = 's';
    }

    if (url.indexOf('wol.jw') !== -1) {
      url = url.replaceAll('/lp-chs/', '/lp-chs-rb/');
    }

    this.chineseLink = url;

    this.verifyTypeOfSite(url, ideogramType);

    const $: any = await this.downloadUrl(url);

    console.log($);

    // const parser = new Parser();
    // let $chinese: any | undefined = $;
    // let $language;

    // if (!this.isChinese) {
    //   $chinese = await this.downloadChineseByLink(
    //     $,
    //     this.isTraditional ? 't' : 's',
    //     url,
    //   );

    //   $language = $;
    //   language = String(
    //     url
    //       .replace('https://www.jw.org/', '')
    //       .replace('https://wol.jw.org/', ''),
    //   )
    //     .split('/')[0]
    //     .toLowerCase();
    // } else if (language) {
    //   $language = await this.downloadLanguage($, language, url);
    // }

    // if (!$chinese) {
    //   throw new Error('Site not found');
    // }

    // let $simplified;
    // if (this.isTraditional) {
    //   $simplified = await this.downloadChineseByLink($chinese, 's', url);
    // }

    // const baseUrl = getBaseUrl(url);

    // const parsedDownload = await parser.parse(
    //   $chinese,
    //   $language,
    //   $simplified,
    //   baseUrl,
    //   this.chineseLink,
    // );

    // if (parsedDownload.links) {
    //   return this.parseLinks(
    //     parsedDownload,
    //     language,
    //     ideogramType,
    //     convertPinyin,
    //   );
    // }

    // return parsedDownload;
  }

  protected verifyTypeOfSite(url: string, ideogramType: string) {
    this.isChinese = false;

    const chineseSites = [
      'https://www.jw.org/cmn-hans',
      'https://www.jw.org/cmn-hant',
      'https://wol.jw.org/cmn-hans',
      'https://wol.jw.org/cmn-hant',
    ];

    for (const chineseSite of chineseSites) {
      if (url.toLowerCase().substring(0, chineseSite.length) === chineseSite) {
        this.isChinese = true;
        break;
      }
    }

    this.isTraditional = false;

    if (url.toLowerCase().indexOf('jw.org/cmn-hant') !== -1) {
      this.isTraditional = true;
    } else if (ideogramType === 't') {
      this.isTraditional = true;
    }
  }

  protected async downloadUrl(url: string): Promise<any> {
    let response;
    profiler(`Download JW Start - ${url}`);
    try {
      response = await this.downloader.download(this.encoder.encodeUrl(url));
    } catch (e) {
      console.error(e);
      profiler('Download on exception: ' + url);
      response = await this.downloader.download(url);
    }
    profiler('Download JW End');

    try {
      response = JSON.parse(response);
      if (response.items[0].content) {
        response = '<div id="article">' + response.items[0].content + '</div>';
      }
    } catch (e) {}

    return cheerio.load(response);
  }

  protected async downloadChineseByLink(
    $: any,
    ideogramType: string,
    url: string,
  ): Promise<any | undefined> {
    let link = '';
    if (url.indexOf('wol.jw') !== -1) {
      const wol = new Wol();
      link = wol.changeUrlLanguage(url, 'cmn-han' + ideogramType);
    } else {
      const chineseLink = $(`link[hreflang="cmn-han${ideogramType}"]`);
      if (chineseLink.length === 0) {
        return;
      }

      const href = chineseLink.attr('href');
      link = href;
      if (href.indexOf('://') === -1) {
        link = `https://www.jw.org${href}`;
      }
    }

    this.chineseLink = link;

    profiler(`Download JW Start - Chinese - ${this.encoder.encodeUrl(link)}`);

    let response;
    try {
      response = await this.downloader.download(this.encoder.encodeUrl(link));
    } catch (e) {
      response = await this.downloader.download(link);
    }

    profiler('Download JW End - Chinese');

    return cheerio.load(response);
  }

  protected async downloadLanguage($: any, language: string, url: string) {
    let link = '';
    if (url.indexOf('wol.jw') !== -1) {
      const wol = new Wol();
      link = wol.changeUrlLanguage(url, language);
    } else {
      const translateLink = $(`link[hreflang="${language}"]`);
      if (translateLink.length > 0) {
        const href = translateLink.attr('href');
        link = href;
        if (href.indexOf('://') === -1) {
          link = `https://www.jw.org${href}`;
        }
      }
    }

    profiler('Download JW (Language) Start');
    const response = await this.downloader.download(link);
    profiler('Download JW (Language) End');
    return cheerio.load(response);
  }

  protected async parseLinks(
    parsedDownload: any,
    language: any,
    ideogramType: any,
    convertPinyin: any,
  ) {
    profiler('Getting links Start');
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
          this.encoder.decodeUrl(jwLink),
          language,
          ideogramType,
          convertPinyin,
        );

        responseLinks.links.push({
          number: l.number,
          title: l.title,
          title_pinyin: l.title_pinyin,
          link: this.encoder.decodeUrl(jwLink),
          content: linkResponse,
        });
      },
      { concurrency: 4 },
    );

    responseLinks.links = orderBy(responseLinks.links, ['number']);

    profiler('Getting links End');

    return responseLinks;
  }
}
