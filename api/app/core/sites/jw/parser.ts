import * as replaceall from 'replaceall';
import * as replaceIdeogramsToSpace from '../../../../../shared/helpers/special-ideograms-chars';
import * as bibleBooks from '../../../../../shared/data/bible/bible';
import { http } from '../../../helpers/http';
import * as UnihanSearch from '../../../services/UnihanSearch';
import { padStart } from 'lodash';

export class Parser {
  protected text: any[] = [];
  protected figcaptionsText: any[] = [];
  protected isChinese: boolean;

  public async parse($, isChinese: boolean) {
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

    return this.getContent($);
  }

  public async getContent($) {
    const downloadResponse: any = {};
    this.text = [];
    downloadResponse.audio = await this.getAudio($);
    this.figcaptionsText = [];

    const mainImage = $('.lsrBannerImage');
    if (mainImage.length) {
      this.text.push({
        large: $(mainImage)
          .find('span')
          .attr('data-zoom'),
        small: $(mainImage)
          .find('span')
          .attr('data-img-size-lg'),
        type: 'img',
      });
    }

    this.text.push({
      text: this.getText($, $('article header h1')),
      type: 'h1',
    });

    let mainElement = $('article > .docSubContent');
    if (!mainElement.length) {
      mainElement = $('article #bibleText');
    }

    if (!mainElement.length) {
      mainElement = $('article .docSubContent');
    }

    mainElement.children().each((i, children) => {
      if ($(children).hasClass('blockTeach')) {
        const boxH2 = $(children).find('aside h2');
        if (boxH2 && $(boxH2).text()) {
          this.text.push({
            text: this.getText($, boxH2),
            type: 'h2',
          });
        }

        this.parseBlock($, $(children).find('.boxContent'));
      } else if ($(children).hasClass('bodyTxt')) {
        $(children)
          .children()
          .each((j, subChildren) => {
            const boxH2 = $(subChildren).children('h2');
            if (boxH2 && $(boxH2).text()) {
              this.text.push({
                text: this.getText($, boxH2),
                type: 'h2',
              });
            }

            $(subChildren)
              .children('div')
              .children()
              .each((k, subChildren02) => {
                this.parseBlock($, subChildren02);
              });
          });
      } else if ($(children).hasClass('article')) {
        $(children)
          .children()
          .each((j, subChildren) => {
            if ($(subChildren).hasClass('questions')) {
              $(subChildren)
                .children()
                .each((k, subChildren02) => {
                  if ($(subChildren02).get(0).tagName === 'h2') {
                    this.text.push({
                      text: this.getText($, subChildren02),
                      type: 'box-h2',
                    });
                  } else if ($(subChildren02).get(0).tagName === 'ul') {
                    $(subChildren02)
                      .children()
                      .each((l, subChildren03) => {
                        this.parseContent($, subChildren03, 'box');
                      });
                  } else {
                    this.parseContent($, subChildren02, 'box');
                  }
                });
            } else {
              this.parseBlock($, subChildren);
            }
          });
      } else {
        this.parseBlock($, children);
      }
    });

    downloadResponse.text = this.text;
    return downloadResponse;
  }

  public async getSummary($) {
    const downloadResponse: any = { text: [], links: [] };
    let items = $('.synopsis h2 a');
    if (items.length === 0) {
      items = $('.musicList .fileTitle a');
    }

    const itemsList: any[] = [];
    items.each((i, item) => {
      itemsList.push(item);
    });

    let i = 0;
    for (const item of itemsList) {
      i += 1;
      const title = this.getText($, item);
      downloadResponse.links.push({
        link: $(item).attr('href'),
        number: padStart(String(i), 3, '0'),
        title,
        title_pinyin: (await UnihanSearch.toPinyin(title))
          .map(item => item.pinyin)
          .filter(item => item.trim() !== '')
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
          this.getText($, $('article header h1')),
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

  public parseBlock($, element) {
    if (
      $(element).attr('class') &&
      $(element)
        .attr('class')
        .indexOf('boxSupplement') !== -1
    ) {
      //
      const boxFigure = $(element).find('.fullBleed figure');
      if (boxFigure.length) {
        this.text.push({
          type: 'box-img',
          large: $(boxFigure)
            .find('span')
            .attr('data-zoom'),
          small: $(boxFigure)
            .find('span')
            .attr('data-img-size-lg'),
        });
      }

      const boxH2 = $(element).find('h2');
      if (boxH2 && $(boxH2).text()) {
        this.text.push({
          text: this.getText($, boxH2),
          type: 'box-h2',
        });
      }

      if ($(element).find('.boxContent').length > 0) {
        $(element)
          .find('.boxContent')
          .children()
          .each((i, subChildren) => {
            if ($(subChildren).get(0).tagName === 'ul') {
              $(subChildren)
                .children()
                .each((j, subChildrenLi) => {
                  $(subChildrenLi)
                    .children()
                    .each((k, subChildrenLiContent) => {
                      this.parseContent($, subChildrenLiContent, 'box');
                    });
                });
            } else {
              this.parseContent($, subChildren, 'box');
            }
          });
      } else {
        const subBoxH2 = $(element).find('table caption');
        if (subBoxH2 && $(subBoxH2).text()) {
          this.text.push({
            text: this.getText($, subBoxH2),
            type: 'box',
          });
        }

        $(element)
          .find('table tr')
          .each((j, subChildrenTr) => {
            this.parseContent($, subChildrenTr, 'box');
          });
      }
    } else if (
      $(element).attr('class') &&
      $(element)
        .attr('class')
        .indexOf('groupFootnote') !== -1
    ) {
      $(element)
        .children()
        .each((l, subChildren) => {
          this.parseContent($, subChildren, 'foot');
        });
    } else {
      this.parseContent($, element, '');
    }
  }

  public parseContent($, element, type) {
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

    if (figure.length) {
      let imgType;
      if (type) {
        imgType = `${type}-img`;
      } else {
        imgType = 'img';
      }

      let large = $(figure)
        .find('span')
        .attr('data-zoom');
      let small = $(figure)
        .find('span')
        .attr('data-img-size-lg');

      if (!large) {
        large = $(figure)
          .find('img')
          .attr('src');
      }

      if (!small) {
        small = $(figure)
          .find('img')
          .attr('src');
      }

      this.text.push({
        type: imgType,
        large,
        small,
      });

      const figcaption = $(figure).find('figcaption');
      if (figcaption.length) {
        let imgCaption;
        if (type) {
          imgCaption = `${type}-imgcaption`;
        } else {
          imgCaption = 'imgcaption';
        }

        const text = this.getText($, figcaption);
        this.figcaptionsText.push(text);

        this.text.push({
          type: imgCaption,
          text,
        });
      }
    }

    let text = this.trim($(element).text());
    if (!text) {
      return;
    }

    text = this.getText($, element);

    if (this.figcaptionsText.indexOf(text) > -1) {
      return;
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

      this.text.push(item);
    });
  }

  public getText($, element) {
    let text = $(element).html();
    if (text === null) {
      return '';
    }

    // asterisk
    const footNotes = $(element).find('.footnoteLink');
    let footNoteId = null;
    if (footNotes.length > 0 && this.isChinese) {
      footNotes.each((i, footNote) => {
        footNoteId = replaceall(
          '#footnote',
          '',
          $(footNote).attr('data-anchor'),
        ).trim();
        text = replaceall(
          $.html(footNote),
          `#FOOTNOTE${$(footNote).html()}`,
          text,
        );
      });
    }

    // bible
    const bibles = $(element).find('.jsBibleLink');
    if (bibles.length > 0 && this.isChinese) {
      bibles.each((i, bible) => {
        const bibleLink = decodeURIComponent($(bible).attr('href')).split('/');
        const bibleBook = bibleLink[6];
        const bibleChapter = bibleLink[7];
        const bibleVerses: any[] = [];
        const bibleVersesLinks = bibleLink[8].split('-');
        bibleVersesLinks.forEach(bibleVersesLink => {
          bibleVerses.push(parseInt(bibleVersesLink.substr(-3), 10));
        });

        text = replaceall(
          $.html(bible),
          `BI#[${bibleBooks[bibleBook]}:${bibleChapter}:${bibleVerses.join(
            '-',
          )}]#BI${$(bible).html()}`,
          text,
        );
      });
    }

    const numberRegex = new RegExp('^[0-9]+$');

    text = replaceall('+', '', text);
    text = replaceall('<strong>', '//STRONG-OPEN//', text);
    text = replaceall('</strong>', '//STRONG-CLOSE//', text);
    text = replaceall('<em>', '//ITALIC-OPEN//', text);
    text = replaceall('</em>', '//ITALIC-CLOSE//', text);
    text = replaceall('<wbr>', ' ', text);
    text = replaceall('<p>', '\r\n<p>', text);
    text = replaceall('<li>', '\r\n<li>', text);
    text = $('<textarea />')
      .html(text)
      .text();
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, ' '); // replace zero width space to space
    text = replaceall(String.fromCharCode(160), ' ', text); // Convert NO-BREAK SPACE to SPACE
    text = replaceall(String.fromCharCode(8201), ' ', text); // Convert THIN SPACE to SPACE
    text = replaceall(String.fromCharCode(8203), '' , text); // Zero Width Space

    text = replaceall('//STRONG-OPEN//', '<b>', text);
    text = replaceall('//STRONG-CLOSE//', '</b>', text);    
    text = replaceall('//ITALIC-OPEN//', '<i>', text);
    text = replaceall('//ITALIC-CLOSE//', '</i>', text);

    if (!this.isChinese) {
      return this.trim(text);
    }

    const lines = text.trim().split('\r\n');

    let newText = '';
    lines.forEach(line => {
      let lineText = '';
      let verifyText = line;
      replaceIdeogramsToSpace.forEach(item => {
        verifyText = replaceall(`${item} `, item, verifyText);
      });

      verifyText = verifyText.replace(/(\d+)/, '');
      verifyText = verifyText.trim();
      if (!verifyText) {
        verifyText = '';
      }

      if (verifyText.split(' ').length === 1) {
        const segementedText = UnihanSearch.segment(line).join(' ');
        lineText = segementedText;
      } else {
        lineText = line;
      }

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

      const wordsToReplace = ['各地', '可见', '称为'];

      wordsToReplace.forEach(word => {
        const replaceWord = ` ${word.split('').join(' ')} `;
        lineText = replaceall(replaceWord, ` ${word} `, lineText);
      });

      if (footNoteId) {
        lineText = replaceall(
          '# FOOTNOTE',
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
        lineText = lineText.replace(/\s{2,}/g, ' ').trim();
      }

      newText += `${lineText}\r\n`;
    });

    text = newText;
    text = this.trim(text);
    return text;
  }

  protected explodeLines(text) {
    return text.split('\r\n').map(s => this.trim(s));
  }

  protected trim(s) {
    return s.trim();
  }

  protected encodeUrl(url: string) {
    let newUrl = 'https://www.jw.org/';
    if (url.substr(0, newUrl.length) !== newUrl) {
      return url;
    }

    const urlParts = url.replace(newUrl, '').split('/');
    urlParts.forEach(urlPart => {
      newUrl += encodeURIComponent(urlPart);
      newUrl += '/';
    });
    return newUrl;
  }
}
