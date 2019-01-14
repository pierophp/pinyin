import * as bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import { padStart } from 'lodash';
import * as replaceall from 'replaceall';
import * as bibleBooks from '../../../../../shared/data/bible/bible';
import * as isChinese from '../../../../../shared/helpers/is-chinese';
import * as separatePinyinInSyllables from '../../../../../shared/helpers/separate-pinyin-in-syllables';
import * as replaceIdeogramsToSpace from '../../../../../shared/helpers/special-ideograms-chars';
import { http } from '../../../helpers/http';
// @ts-ignore
import * as UnihanSearch from '../../../services/UnihanSearch';
import { AbstractParser } from '../abstract.parser';
import { Downloader as GenericDownloader } from '../downloader';
import { PdfParser } from './pdf.parser';
import * as moment from 'moment';
import { profiler } from '../../../helpers/profiler';
import * as getPdfParsedObject from '../../../../../pdf-pinyin/src/core/get.pdf.parsed.object';

interface TextInterface {
  text?: string;
  large?: string;
  small?: string;
  type?: string;
}

export class Parser extends AbstractParser {
  protected figcaptionsText: any[] = [];
  protected isChinese: boolean;
  protected pdfParsedObjectPromise?: Promise<any>;
  protected promisesToExecute: (() => Promise<TextInterface[]>)[];
  protected profilePdfParseStart;
  protected profilePdfParseEnd;

  public async parse(
    $,
    isChinese: boolean,
    isTraditional: boolean,
  ): Promise<any> {
    this.isChinese = isChinese;

    $('.viewOptions').remove();
    $('noscript').remove();
    $('#docSubVideo').remove();
    $('#docSubImg').remove();

    if (
      ($('.toc').length > 0 && $('article .docSubContent').length === 0) ||
      $('#musicTOC').length > 0
    ) {
      return await this.getSummary($);
    }

    await this.getPinyinPdf($);

    return await this.getContent($);
  }

  protected async parseResult($, element, type): Promise<TextInterface[]> {
    const result = await this.getText($, element);

    const response: TextInterface[] = [];

    for (const item of result) {
      response.push({
        text: item,
        type,
      });
    }

    return response;
  }

  public async getContent($) {
    const downloadResponse: any = {};

    this.promisesToExecute = [];
    downloadResponse.audio = await this.getAudio($);
    this.figcaptionsText = [];

    const mainImage = $('.lsrBannerImage');
    if (mainImage.length) {
      this.promisesToExecute.push(
        async (): Promise<TextInterface[]> => {
          return [
            {
              large: $(mainImage)
                .find('span')
                .attr('data-zoom'),
              small: $(mainImage)
                .find('span')
                .attr('data-img-size-lg'),
              type: 'img',
            },
          ];
        },
      );
    }

    if ($('article header h1').length) {
      this.promisesToExecute.push(
        async (): Promise<TextInterface[]> => {
          return await this.parseResult($, $('article header h1'), 'h1');
        },
      );
    }

    const mainElements = [
      'article > .docSubContent .textSizeIncrement > div[class=""]',
      'article > .docSubContent .textSizeIncrement',
      'article > .docSubContent',
      'article #bibleText',
      'article .docSubContent',
      '#dailyText',
      '#article',
    ];

    let mainElement: any;
    for (const me of mainElements) {
      mainElement = $(me);
      if (mainElement.length) {
        break;
      }
    }

    for (const children of mainElement.children().toArray()) {
      if ($(children).hasClass('blockTeach')) {
        const boxH2 = $(children).find('aside h2');
        if (boxH2 && $(boxH2).text()) {
          this.promisesToExecute.push(
            async (): Promise<TextInterface[]> => {
              return await this.parseResult($, boxH2, 'h2');
            },
          );
        }

        await this.parseBlock($, $(children).find('.boxContent'));
      } else if ($(children).hasClass('bodyTxt')) {
        for (const subChildren of $(children)
          .children()
          .toArray()) {
          const boxH2 = $(subChildren).children('h2');
          if (boxH2 && $(boxH2).text()) {
            this.promisesToExecute.push(
              async (): Promise<TextInterface[]> => {
                return await this.parseResult($, boxH2, 'h2');
              },
            );
          }

          let bodyTxtChildren = $(subChildren).children('div.pGroup');

          if (bodyTxtChildren.length === 0) {
            bodyTxtChildren = $(subChildren).children('div');
          }

          for (const subChildren02 of bodyTxtChildren.children().toArray()) {
            await this.parseBlock($, subChildren02);
          }
        }
      } else if ($(children).hasClass('article')) {
        for (const subChildren of $(children)
          .children()
          .toArray()) {
          if ($(subChildren).hasClass('questions')) {
            for (const subChildren02 of $(subChildren)
              .children()
              .toArray()) {
              if ($(subChildren02).get(0).tagName === 'h2') {
                this.promisesToExecute.push(
                  async (): Promise<TextInterface[]> => {
                    return await this.parseResult($, subChildren02, 'box-h2');
                  },
                );
              } else if ($(subChildren02).get(0).tagName === 'ul') {
                for (const subChildren03 of $(subChildren02)
                  .children()
                  .toArray()) {
                  await this.parseContent($, subChildren03, 'box');
                }
              } else {
                await this.parseContent($, subChildren02, 'box');
              }
            }
          } else {
            await this.parseBlock($, subChildren);
          }
        }
      } else {
        await this.parseBlock($, children);
      }
    }

    profiler(
      'Start Process promises ' + (this.isChinese ? 'CHINESE' : 'LANGUAGE'),
    );

    const result = await bluebird.map(
      this.promisesToExecute,
      async promiseFunction => {
        return await promiseFunction();
      },
      { concurrency: 10 },
    );

    if (this.profilePdfParseStart) {
      profiler(
        `Pdf Parse Time ${this.profilePdfParseStart} - ${
          this.profilePdfParseEnd
        }`,
      );
    }

    let text: any[] = [];
    for (const item of result) {
      text = text.concat(item);
    }

    downloadResponse.text = text;

    return downloadResponse;
  }

  public async getSummary($) {
    const downloadResponse: any = { text: [], links: [] };
    let items = $('.synopsis .syn-body');
    if (items.length === 0) {
      items = $('.musicList');
    }

    const itemsList: any[] = [];
    items.each((i, item) => {
      itemsList.push(item);
    });

    let i = 0;
    for (const item of itemsList) {
      i += 1;

      let link = $(item).find('h2 a');
      if (link.length === 0) {
        link = $(item).find('.fileTitle a');
      }

      const subtitle = $(item).find('.contextTitle');

      let title = '';
      let titleArray = await this.getText($, link);
      title = titleArray[0];

      if (subtitle.length) {
        titleArray = await this.getText($, subtitle);
        title = titleArray[0] + ' - ' + title;
      }

      downloadResponse.links.push({
        link: $(link).attr('href'),
        number: padStart(String(i), 3, '0'),
        title,
        title_pinyin: (await UnihanSearch.toPinyin(title.split(' ')))
          .map(item => {
            if (!isChinese(item.ideogram)) {
              return item.pinyin.split('').join(String.fromCharCode(160));
            }

            const pinyinSeparated = separatePinyinInSyllables(item.pinyin);

            return pinyinSeparated.join(String.fromCharCode(160));
          })
          .join(String.fromCharCode(160)),
      });
    }

    return downloadResponse;
  }

  public async getAudio($) {
    let media = $('.jsAudioPlayer a');
    if (this.isChinese && media.length > 0) {
      return media.attr('href');
    } else if (this.isChinese) {
      media = $('.jsAudioFormat a');
      if (media.length === 0) {
        return null;
      }

      try {
        let titleWithoutSpaces = replaceall(
          ' ',
          '',
          await this.getText($, $('article header h1')),
        );
        replaceIdeogramsToSpace.forEach(item => {
          titleWithoutSpaces = replaceall(item, '', titleWithoutSpaces);
        });

        if (!titleWithoutSpaces) {
          return null;
        }

        const responseAudio = await http.get(
          this.encodeUrl(media.attr('data-jsonurl')),
        );

        let fileUrl = null;

        responseAudio.data.files.CHS.MP3.some(file => {
          let audioTitleWithoutSpaces = replaceall(' ', '', file.title);
          replaceIdeogramsToSpace.forEach(item => {
            audioTitleWithoutSpaces = replaceall(
              item,
              '',
              audioTitleWithoutSpaces,
            );
          });

          if (audioTitleWithoutSpaces.contains(titleWithoutSpaces)) {
            fileUrl = file.file.url;
            return true;
          }

          return false;
        });

        return fileUrl;
      } catch (e) {
        // eslint-disable-next-line
        console.log(e);
      }
    }

    return null;
  }

  public async parseBlock($, element) {
    if (
      $(element).attr('class') &&
      $(element)
        .attr('class')
        .indexOf('boxSupplement') !== -1
    ) {
      //
      const boxFigure = $(element).find('.fullBleed figure');
      if (boxFigure.length) {
        this.promisesToExecute.push(
          async (): Promise<TextInterface[]> => {
            return [
              {
                type: 'box-img',
                large: $(boxFigure)
                  .find('span')
                  .attr('data-zoom'),
                small: $(boxFigure)
                  .find('span')
                  .attr('data-img-size-lg'),
              },
            ];
          },
        );
      }

      const boxH2 = $(element).find('h2');
      if (boxH2 && $(boxH2).text()) {
        this.promisesToExecute.push(
          async (): Promise<TextInterface[]> => {
            return await this.parseResult($, boxH2, 'box-h2');
          },
        );
      }

      if ($(element).find('.boxContent').length > 0) {
        for (const subChildren of $(element)
          .find('.boxContent')
          .children()
          .toArray()) {
          if ($(subChildren).get(0).tagName === 'ul') {
            for (const subChildrenLi of $(subChildren)
              .children()
              .toArray()) {
              for (const subChildrenLiContent of $(subChildrenLi)
                .children()
                .toArray()) {
                await this.parseContent($, subChildrenLiContent, 'box');
              }
            }
          } else if ($(subChildren).find('.imgGrid').length) {
            for (const subChildrenImgGrid of $(subChildren)
              .find('.imgGrid')
              .toArray()) {
              await this.parseContent($, subChildrenImgGrid, 'box');
            }
          } else {
            await this.parseContent($, subChildren, 'box');
          }
        }
      } else {
        const subBoxH2 = $(element).find('table caption');
        if (subBoxH2 && $(subBoxH2).text()) {
          this.promisesToExecute.push(
            async (): Promise<TextInterface[]> => {
              return await this.parseResult($, subBoxH2, 'box');
            },
          );
        }

        for (const subChildrenTr of $(element)
          .find('table tr')
          .toArray()) {
          await this.parseContent($, subChildrenTr, 'box');
        }
      }
    } else if (
      $(element).attr('class') &&
      $(element)
        .attr('class')
        .indexOf('groupFootnote') !== -1
    ) {
      for (const subChildren of $(element)
        .children()
        .toArray()) {
        await this.parseContent($, subChildren, 'foot');
      }
    } else {
      await this.parseContent($, element, '');
    }
  }

  public async parseContent($, element, type) {
    if ($(element).hasClass('qu')) {
      type = 'qu';
    }

    if ($(element).hasClass('stdPullQuote')) {
      type = 'box';
    }

    let footnote = null;
    if (type === 'foot') {
      footnote = replaceall('footnote', '', $(element).attr('id'));
    }

    const figure = $(element).find('figure');

    if (figure.length && $(element).get(0).tagName === 'aside') {
      return;
    }

    await this.getImages($, figure, type);

    this.promisesToExecute.push(
      async (): Promise<TextInterface[]> => {
        let text = this.trim($(element).text());
        if (!text) {
          return [];
        }

        const textList: TextInterface[] = [];

        text = await this.getText($, element);

        if (this.figcaptionsText.indexOf(text) > -1) {
          return [];
        }

        this.explodeLines(text).forEach(line => {
          if (!line) {
            return;
          }

          const item: any = {
            text: line,
          };

          if (type) {
            item.type = type;
          }

          if (footnote) {
            item.footnote = footnote;
          }

          textList.push(item);
        });

        return textList;
      },
    );
  }

  public async getText($, element): Promise<any[]> {
    let text = $(element).html();
    if (text === null) {
      return [];
    }

    // asterisk
    const footNotes = $(element).find('.footnoteLink');
    let footNoteIds: any[] = [];
    if (footNotes.length > 0 && this.isChinese) {
      footNotes.each((i, footNote) => {
        const footNoteId = replaceall(
          '#footnote',
          '',
          $(footNote).attr('data-anchor'),
        ).trim();

        footNoteIds.push(footNoteId);

        text = replaceall(
          $.html(footNote),
          `#FOOTNOTE${footNoteId}${$(
            footNote,
          ).html()}#ENDFOOTNOTE${footNoteId}`,
          text,
        );
      });
    }

    // // bible
    const bibles = $(element)
      .find('.jsBibleLink')
      .toArray();

    const bibleLinks: any[] = [];
    if (bibles.length > 0 && this.isChinese) {
      for (const bible of bibles) {
        const bibleLink = decodeURIComponent($(bible).attr('href')).split('/');
        const bibleBook = bibleLink[6];
        const bibleChapter = bibleLink[7];
        const bibleVerses: any[] = [];
        const bibleVersesLinks = bibleLink[8].split('-');

        for (const bibleVersesLink of bibleVersesLinks) {
          bibleVerses.push(parseInt(bibleVersesLink.substr(-3), 10));
        }

        bibleLinks.push({
          text: $(bible).text(),
          link: `${bibleBooks[bibleBook]}:${bibleChapter}:${bibleVerses.join(
            '-',
          )}`,
        });

        text = replaceall(
          $.html(bible),
          `BI#[${bibleBooks[bibleBook]}:${bibleChapter}:${bibleVerses.join(
            '-',
          )}]#BI${$(bible).html()}]#ENDBI`,
          text,
        );
      }
    }

    text = this.removeHtmlSpecialTags($, text);

    if (!this.isChinese) {
      return this.trim(text)
        .split('\r\n')
        .filter(item => item);
    }

    if (this.pdfParsedObjectPromise) {
      return await this.parseWithPdf(text, footNoteIds);
    }

    return await this.parseWithoutPdf(text, bibles, footNoteIds);
  }

  protected encodeUrl(url: string) {
    let newUrl = 'https://www.jw.org/';
    if (url.substr(0, newUrl.length) !== newUrl) {
      return url;
    }

    const urlParts = url.replace(newUrl, '').split('/');
    for (const urlPart of urlParts) {
      newUrl += encodeURIComponent(urlPart);
      newUrl += '/';
    }

    return newUrl;
  }

  protected async getImages($, figure, type) {
    if (!figure.length) {
      return;
    }

    let imgType;
    if (type) {
      imgType = `${type}-img`;
    } else {
      imgType = 'img';
    }

    const spanImages = $(figure).find('span');

    if (spanImages.length) {
      for (const spanImage of spanImages.toArray()) {
        const large = $(spanImage).attr('data-zoom');

        const small = $(spanImage).attr('data-img-size-lg');
        this.promisesToExecute.push(
          async (): Promise<TextInterface[]> => {
            return [
              {
                type: imgType,
                large,
                small,
              },
            ];
          },
        );
      }
    } else {
      for (const a of $(figure)
        .find('a')
        .toArray()) {
        const large = $(a).attr('href');
        const small = $(a)
          .find('img')
          .attr('src');

        this.promisesToExecute.push(
          async (): Promise<TextInterface[]> => {
            return [
              {
                type: imgType,
                large,
                small,
              },
            ];
          },
        );
      }
    }

    const figcaption = $(figure).find('figcaption');
    if (figcaption.length) {
      let imgCaption;
      if (type) {
        imgCaption = `${type}-imgcaption`;
      } else {
        imgCaption = 'imgcaption';
      }

      this.promisesToExecute.push(
        async (): Promise<TextInterface[]> => {
          const result = await this.parseResult($, figcaption, imgCaption);
          for (const item of result) {
            this.figcaptionsText.push(item);
          }

          return result;
        },
      );
    }
  }

  public async parseWithPdf(text, footNoteIds: string[]) {
    const pdfParser = new PdfParser();

    let lineJustIdeograms = replaceall(' ', '', text);

    lineJustIdeograms = replaceall('BI#[', '<bible text="', lineJustIdeograms);
    lineJustIdeograms = replaceall(']#BI', '">', lineJustIdeograms);
    lineJustIdeograms = replaceall(']#ENDBI', '</bible>', lineJustIdeograms);

    for (const footNoteId of footNoteIds) {
      lineJustIdeograms = replaceall(
        `#FOOTNOTE${footNoteId}`,
        `<footnote id="${footNoteId}">`,
        lineJustIdeograms,
      );

      lineJustIdeograms = replaceall(
        `#ENDFOOTNOTE${footNoteId}`,
        '</footnote>',
        lineJustIdeograms,
      );
    }

    const lines = lineJustIdeograms
      .trim()
      .split('\r\n')
      .filter(item => item);

    if (!this.profilePdfParseStart) {
      this.profilePdfParseStart = moment().format('HH:mm:ss');
    }

    const parsedResult = await pdfParser.parse(
      this.pdfParsedObjectPromise!,
      lines,
    );

    this.profilePdfParseEnd = moment().format('HH:mm:ss');

    return parsedResult;
  }

  public async parseWithoutPdf(text: string, bibles, footNoteIds: string[]) {
    const numberRegex = new RegExp('^[0-9]+$');

    text = replaceall(']#ENDBI', '', text);

    for (const footNoteId of footNoteIds) {
      text = replaceall(`#ENDFOOTNOTE${footNoteId}`, '', text);
      text = replaceall(`#FOOTNOTE${footNoteId}`, '#FOOTNOTE', text);
    }

    const lines = text
      .trim()
      .split('\r\n')
      .filter(item => item);

    const newText: any[] = [];
    for (const line of lines) {
      let lineText = '';
      lineText = this.segmentText(line);

      const specialWord = 'JOIN_SPECIAL';

      // separate by numbers
      lineText = lineText
        .split(/(\d+)/)
        .map(item => {
          if (numberRegex.test(item)) {
            item = ` ${item}${specialWord} `;
          }
          return item;
        })
        .join('');

      replaceIdeogramsToSpace.forEach(item => {
        lineText = replaceall(item, ` ${item}${specialWord} `, lineText);
      });

      // remove double spaces
      if (lineText) {
        lineText = lineText.replace(/\s{2,}/g, ' ').trim();
      }

      // bold
      lineText = replaceall('< b >', '<b>', lineText);
      lineText = replaceall('< /b >', '</b>', lineText);

      lineText = replaceall(
        `<${specialWord} b >${specialWord}`,
        '<b>',
        lineText,
      );
      lineText = replaceall(
        `<${specialWord} /b >${specialWord}`,
        '</b>',
        lineText,
      );
      lineText = replaceall(
        `<${specialWord} / b >${specialWord}`,
        '</b>',
        lineText,
      );

      lineText = replaceall('<b>', ' <b> ', lineText);
      lineText = replaceall('</b>', ' </b> ', lineText);

      // italic
      lineText = replaceall('< i >', '<i>', lineText);
      lineText = replaceall('< /i >', '</i>', lineText);

      lineText = replaceall(
        `<${specialWord} i >${specialWord}`,
        '<i>',
        lineText,
      );
      lineText = replaceall(
        `<${specialWord} / i >${specialWord}`,
        '</i>',
        lineText,
      );
      lineText = replaceall(
        `<${specialWord} /i >${specialWord}`,
        '</i>',
        lineText,
      );

      lineText = replaceall('<i>', ' <i> ', lineText);
      lineText = replaceall('</i>', ' </i> ', lineText);

      // remove double spaces
      if (lineText) {
        lineText = lineText.replace(/\s{2,}/g, ' ').trim();
      }

      const ideograms = lineText.split(' ');
      const ideogramsFiltered: any[] = [];

      let joinSpecial = '';

      ideograms.forEach(ideogram => {
        if (ideogram === specialWord) {
          return;
        }

        if (
          ideogram.substring(ideogram.length - specialWord.length) ===
          specialWord
        ) {
          joinSpecial += ideogram.replace(specialWord, '');
          return;
        } else if (joinSpecial) {
          ideogramsFiltered.push(joinSpecial);
          joinSpecial = '';
        }

        ideogramsFiltered.push(ideogram);
      });

      if (joinSpecial) {
        ideogramsFiltered.push(joinSpecial);
      }

      lineText = ` ${ideogramsFiltered.join(' ')} `;

      lineText = this.replaceWords(lineText);

      if (footNoteIds.length) {
        const footNoteId = footNoteIds[0];

        lineText = replaceall(
          '# FOOTNOTE',
          ` #FOOTNOTE-${footNoteId}-`,
          lineText,
        );

        lineText = replaceall(
          '# F O O T N O T E',
          ` #FOOTNOTE-${footNoteId}-`,
          lineText,
        );

        lineText = replaceall('- *', '-*', lineText);
      }

      if (bibles.length > 0 && this.isChinese) {
        // separate ）from numbers
        lineText = lineText.replace(/([1-9])(）)/g, '$1 $2');
        lineText = replaceall('BI #[', ' BI#[', lineText);
        lineText = replaceall(']# BI', ']#BI ', lineText);
        lineText = replaceall('B I #[', 'BI#[', lineText);
        lineText = replaceall(']# B I', ']#BI', lineText);
        lineText = lineText.replace(/\s{2,}/g, ' ').trim();
      }

      newText.push(this.trim(lineText));
    }

    return newText;
  }

  protected async getPinyinPdf($) {
    if (!this.isChinese) {
      return;
    }

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
        if (children.attribs.href.indexOf('.pdf') === -1) {
          return;
        }

        if (children.attribs.href.indexOf('-Pi_') === -1) {
          return;
        }

        pdfPinyinList.push(children.attribs.href);
      });

      if (pdfPinyinList.length) {
        const pdfPinyin = pdfPinyinList.join('|||');
        this.pdfParsedObjectPromise = getPdfParsedObject(pdfPinyin);
      }
    }
  }
}
