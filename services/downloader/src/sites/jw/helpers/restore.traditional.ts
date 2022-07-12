import striptags from 'https://esm.sh/striptags@3.2.0';

import { BlockInterface } from '../../../interfaces/block.interface.ts';
import { replaceAt } from '../../helpers/replace.at.ts';

export function restoreTraditional(
  text: string,
  parsedResult: BlockInterface[],
): BlockInterface[] {
  const traditionalBlocks = striptags(text)
    .trim()
    .split(' ')
    .filter((item) => item)
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

    for (const _simplifiedC of simplifiedBlock.c.split('')) {
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
