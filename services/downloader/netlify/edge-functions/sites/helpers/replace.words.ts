import * as replaceall from 'replaceall';

export function replaceWords(lineText: string): string {
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
