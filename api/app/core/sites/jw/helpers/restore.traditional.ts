import * as striptags from 'striptags';
import { BlockInterface } from '../../../../core/interfaces/block.interface';
import { replaceAt } from '../../../../core/sites/helpers/replace.at';

export function restoreTraditional(
  text: string,
  parsedResult: BlockInterface[],
): BlockInterface[] {
  const traditionalBlocks = striptags(text)
    .split(' ')
    .filter(item => item)
    .join('');

  let traditionalCounter = 0;
  let blockCounter = 0;

  for (const simplifiedBlock of parsedResult) {
    let characterCount = 0;

    if (!simplifiedBlock.c) {
      continue;
    }

    if (!traditionalBlocks[traditionalCounter]) {
      continue;
    }

    for (const simplifiedC of simplifiedBlock.c.split('')) {
      parsedResult[blockCounter].c = replaceAt(
        simplifiedBlock.c,
        characterCount,
        traditionalBlocks[traditionalCounter],
      );
      traditionalCounter++;
      characterCount++;
    }

    blockCounter++;
  }

  return parsedResult;
}
