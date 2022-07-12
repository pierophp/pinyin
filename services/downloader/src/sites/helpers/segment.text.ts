import { specialIdeogramsChars } from '../../data/special-ideograms-chars.ts';
import { separateWords } from '../../helpers/separate.words.ts';

// @todo remove this
function replaceall(item: string, search: string, replace: string) {
  return item.replaceAll(search, replace);
}

export async function segmentText(line: string): Promise<string> {
  let verifyText = line;

  specialIdeogramsChars.forEach((item: any) => {
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
