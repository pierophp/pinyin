import * as opencc from 'node-opencc';
import * as TradOrSimp from 'traditional-or-simplified';
import { RedisCache } from '../../cache/redis.cache';

export class IdeogramsConverter {
  public convertIdeogramsToUtf16(ideograms: string): string {
    const ideogramsConverted: string[] = [];
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted.push(ideograms[i].charCodeAt(0).toString(16));
    }

    return ideogramsConverted.join('|');
  }

  public convertUtf16ToIdeograms(ideogramsUtf16: string): string {
    const ideograms = ideogramsUtf16.split('|');
    let ideogramsConverted = '';
    for (let i = 0; i < ideograms.length; i += 1) {
      ideogramsConverted += String.fromCodePoint(parseInt(ideograms[i], 16));
    }

    return ideogramsConverted;
  }

  public async simplifiedToTraditional(ideogram: string) {
    if (!TradOrSimp.isSimplified(ideogram)) {
      return ideogram;
    }

    const cacheKey = `SIMPLIFIED_TO_TRADITIONAL_${ideogram}`;
    let response = await RedisCache.get(cacheKey);
    if (response) {
      return response;
    }

    response = await opencc.simplifiedToTraditional(ideogram);
    await RedisCache.set(cacheKey, response);
    return response;
  }

  public async traditionalToSimplified(ideogram: string) {
    if (!TradOrSimp.isTraditional(ideogram)) {
      return ideogram;
    }

    const cacheKey = `TRADITIONAL_TO_SIMPLIFIED_${ideogram}`;
    let response = await RedisCache.get(cacheKey);
    if (response) {
      return response;
    }

    response = await opencc.traditionalToSimplified(ideogram);
    await RedisCache.set(cacheKey, response);
    return response;
  }
}
