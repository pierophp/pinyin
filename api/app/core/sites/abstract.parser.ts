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
}
