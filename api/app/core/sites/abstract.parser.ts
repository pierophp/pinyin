import * as replaceall from 'replaceall';
import * as replaceIdeogramsToSpace from '../../../../shared/helpers/special-ideograms-chars';
// @ts-ignore
import * as UnihanSearch from '../../services/UnihanSearch';

export class AbstractParser {
  public replaceWords(lineText: string): string {
    const wordsToReplace = [
      '各地',
      '可见',
      '称为',
      '处于',
      '忠于',
      '何时',
      '以为',
      '因为',
      '成为',
      '身为',
    ];

    const wordsToReplaceTraditional = [
      '可見',
      '稱為',
      '處於',
      '忠於',
      '何時',
      '以為',
      '因為',
      '成為',
      '身為',
    ];

    wordsToReplace.concat(wordsToReplaceTraditional).forEach(word => {
      const replaceWord = ` ${word.split('').join(' ')} `;
      lineText = replaceall(replaceWord, ` ${word} `, lineText);
    });

    return lineText;
  }

  public segmentText(line: string): string {
    let verifyText = line;

    replaceIdeogramsToSpace.forEach(item => {
      verifyText = replaceall(`${item} `, item, verifyText);
    });

    verifyText = verifyText.replace(/(\d+)/, '');
    verifyText = verifyText.trim();
    if (!verifyText) {
      verifyText = '';
    }

    const minimunWords = replaceall(' ', '', verifyText).length / 2.5;

    if (verifyText.split(' ').length < minimunWords) {
      return UnihanSearch.segment(line).join(' ');
    }

    return line;
  }

  protected explodeLines(text) {
    if (typeof text === 'string') {
      return text.split('\r\n').map(s => this.trim(s));
    }

    return text;
  }

  protected trim(s) {
    return s.trim();
  }

  protected removeHtmlSpecialTags($, text: string): string {
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
    text = replaceall(String.fromCharCode(8203), ' ', text); // Zero Width Space

    text = replaceall('//STRONG-OPEN//', '<b>', text);
    text = replaceall('//STRONG-CLOSE//', '</b>', text);
    text = replaceall('//ITALIC-OPEN//', '<i>', text);
    text = replaceall('//ITALIC-CLOSE//', '</i>', text);

    return text;
  }
}
