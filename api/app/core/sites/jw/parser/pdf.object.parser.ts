import * as cheerio from 'cheerio';
import * as getPdfParsedObject from 'pdf-pinyin/src/core/get.pdf.parsed.object';
import { Downloader as GenericDownloader } from '../../downloader';
import * as env from '../../../../../env';

export class PdfObjecyParser {
  public async parse($: any): Promise<any> {
    const download = $('.digitalPubFormat .jsDownload');
    let href = '';
    download.each((i, children) => {
      if (href) {
        return;
      }

      if (children.attribs.href.indexOf('PDF') !== -1) {
        href = children.attribs.href;
      }
    });

    if (href) {
      const downloader = new GenericDownloader();
      const content = await downloader.download(href);

      let $pdf = cheerio.load(content);

      const links = $pdf('.standardDownloadResults a');
      const pdfPinyinList: any[] = [];
      links.each((i, children) => {
        // @ts-ignore
        if (children.attribs.href.indexOf('.pdf') === -1) {
          return;
        }

        // @ts-ignore
        if (children.attribs.href.indexOf('-Pi_') === -1) {
          return;
        }

        // @ts-ignore
        pdfPinyinList.push(children.attribs.href);
      });

      let dirname = `${__dirname.replace(
        'dist/api/',
        '',
      )}/../../../../../storage/`;

      if (env.storage_path) {
        dirname = `${env.storage_path}`;
      }

      if (pdfPinyinList.length) {
        const pdfPinyin = pdfPinyinList.join('|||');
        return getPdfParsedObject(pdfPinyin, true, {
          dirname: `${dirname}pdf-pinyin`,
        });
      }
    }
  }
}
