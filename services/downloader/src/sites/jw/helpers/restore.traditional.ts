import { createRequire } from 'https://deno.land/std/node/module.ts';

import { BlockInterface } from '../../../interfaces/block.interface.ts';
import { replaceAt } from '../../helpers/replace.at.ts';

const require = createRequire(import.meta.url);
const striptags = require('striptags');

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
