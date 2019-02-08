import * as cheerio from 'cheerio';
import { Downloader as GenericDownloader } from '../downloader';
import { Parser } from './parser';
import { writeFile } from 'fs-extra';

export class Songs {
  public async get(): Promise<void> {
    const baseUrl = 'https://www.jw.org';
    const url = `${baseUrl}/cmn-hans/出版物/音乐/高声欢唱/`;
    const urlT = `${baseUrl}/cmn-hant/出版物/音樂/高聲歡唱/`;

    const downloader = new GenericDownloader();

    const response = await downloader.download(url);
    const responseT = await downloader.download(urlT);

    const $list = cheerio.load(response);
    const $listT = cheerio.load(responseT);

    const xpath = '.musicList .musicFileContainer .fileTitle a';

    const links = $list(xpath).toArray();
    const linksT = $listT(xpath).toArray();

    let song = 0;

    const parser = new Parser();
    let i = 0;
    for (const link of links) {
      song++;

      const songLink = baseUrl + $list(link).attr('href');
      const songLinkT = baseUrl + $listT(linksT[i]).attr('href');

      const response = await downloader.download(songLink);
      const responseT = await downloader.download(songLinkT);

      const $ = cheerio.load(response);
      const $T = cheerio.load(responseT);

      const dirname = `${__dirname}/../../../../../../../ui/public/static/songs/`;

      const parsedDownload = await parser.parse($);

      await writeFile(
        `${dirname}cmn-hans/${song}.json`,
        JSON.stringify({ lines: parsedDownload.text }),
      );

      const parsedDownloadT = await parser.parse($T, undefined, $);

      await writeFile(
        `${dirname}cmn-hant/${song}.json`,
        JSON.stringify({ lines: parsedDownloadT.text }),
      );

      i++;
    }
  }
}
