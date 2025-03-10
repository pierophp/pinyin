import { specialIdeogramsChars } from '../../data/special-ideograms-chars.ts';

import { explodeLines } from '../helpers/explode.lines.ts';
import { removeHtmlSpecialTags } from '../helpers/remove.html.special.tags.ts';
import { replaceWords } from '../helpers/replace.words.ts';
import { segmentText } from '../helpers/segment.text.ts';

// @todo remove this
function replaceall(search: string, replace: string, item: string) {
  return item.replaceAll(search, replace);
}

export class Parser {
  protected text: any[] = [];
  protected figcaptionsText: any[] = [];
  protected isChinese = false;

  public async parse($: any, isChinese: boolean, baseUrl: string) {
    this.isChinese = isChinese;

    return this.getContent($);
  }

  public async getContent($: any) {
    const downloadResponse: any = {};
    this.text = [];

    this.figcaptionsText = [];

    if ($('article header h1').length) {
      this.text.push({
        text: await this.getText($, $('article header h1')),
        type: 'h1',
      });
    }

    let mainElement = $('article');

    if (!mainElement.length) {
      mainElement = $('#article');
    }

    if (!mainElement.length) {
      mainElement = $('#content');
    }

    if (!mainElement.length) {
      mainElement = $('.main');
    }

    if (!mainElement.length) {
      mainElement = $('body');
    }

    mainElement.children().each((i: number, children: any) => {
      this.parseBlock($, children);
    });

    downloadResponse.text = this.text;
    return downloadResponse;
  }

  public async parseBlock($: any, element: any) {
    await this.parseContent($, element, '');
  }

  public async parseContent($: any, element: any, type: string) {
    if ($(element).hasClass('qu')) {
      type = 'qu';
    }

    if ($(element).hasClass('stdPullQuote')) {
      type = 'box';
    }

    let footnote: any = null;
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

      let large = $(figure).find('span').attr('data-zoom');
      let small = $(figure).find('span').attr('data-img-size-lg');

      if (!large) {
        large = $(figure).find('img').attr('src');
      }

      if (!small) {
        small = $(figure).find('img').attr('src');
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

        const text = await this.getText($, figcaption);
        this.figcaptionsText.push(text);

        this.text.push({
          type: imgCaption,
          text,
        });
      }
    }

    let text = $(element).text().trim();
    if (!text) {
      return;
    }

    text = await this.getText($, element);

    if (this.figcaptionsText.indexOf(text) > -1) {
      return;
    }

    explodeLines(text).forEach((line) => {
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

  public async getText($: any, element: any) {
    let text = $(element).html();
    if (text === null) {
      return '';
    }

    text = removeHtmlSpecialTags($, text);

    if (!this.isChinese) {
      return text.trim();
    }

    const lines = text.trim().split('\r\n');

    const numberRegex = new RegExp('^[0-9]+$');

    let newText = '';

    for (const line of lines) {
      let lineText = await segmentText(line);

      const specialWord = 'JOIN_SPECIAL';

      // separate by numbers
      lineText = lineText
        .split(/(\d+)/)
        .map((item) => {
          if (numberRegex.test(item)) {
            item = ` ${item}${specialWord} `;
          }
          return item;
        })
        .join('');

      specialIdeogramsChars.forEach((item) => {
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

      ideograms.forEach((ideogram) => {
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

      lineText = replaceWords(lineText);

      newText += `${lineText}\r\n`;
    }

    text = newText;
    (text = text).trim();
    return text;
  }
}
