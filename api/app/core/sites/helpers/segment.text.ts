import * as replaceall from 'replaceall';
import * as replaceIdeogramsToSpace from '../../../../../shared/helpers/special-ideograms-chars';
import { separateWords } from '../../../helpers/separate.words';

export async function segmentText(line: string): Promise<string> {
  let verifyText = line;

  replaceIdeogramsToSpace.forEach((item) => {
    verifyText = replaceall(`${item} `, item, verifyText);
  });

  verifyText = verifyText.replace(/(\d+)/, '');
  verifyText = verifyText.trim();
  if (!verifyText) {
    verifyText = '';
  }

  const minimunWords = replaceall(' ', '', verifyText).length / 2.5;

  if (verifyText.split(' ').length < minimunWords) {
    return (await separateWords(line)).join(' ');
  }

  return line;
}
