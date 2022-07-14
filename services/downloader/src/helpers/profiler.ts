import { format } from 'https://deno.land/std@0.147.0/datetime/mod.ts';
import { getEnv } from './get.env.ts';

export function profiler(str: string, forceOnProduction?: boolean) {
  if (getEnv('PROFILER_ENABLED') !== '1' || forceOnProduction !== true) {
    return;
  }

  let memoryMessage = '';
  if (getEnv('PROFILER_SHOW_MEMORY') === '1') {
    let memoryUsage = {
      heapUsed: 0,
      heapTotal: 0,
      rss: 0,
    };

    const isDeno = typeof Deno !== 'undefined';
    if (isDeno) {
      memoryUsage = Deno.memoryUsage();
    } else {
      // @ts-ignore
      memoryUsage = process.memoryUsage();
    }

    const heapUsed = parseFloat(
      (memoryUsage.heapUsed / 1024 / 1024).toString(),
    ).toFixed(2);

    const memoryTotal = parseFloat(
      (memoryUsage.heapTotal / 1024 / 1024).toString(),
    ).toFixed(2);

    const memoryRSS = parseFloat(
      (memoryUsage.rss / 1024 / 1024).toString(),
    ).toFixed(2);

    memoryMessage = `- Mem RSS ${heapUsed}MB - Mem Tot ${memoryTotal}MB - Mem Usag ${memoryRSS}MB `;
  }

  // eslint-disable-next-line
  console.log(`${format(new Date(), 'HH:mm:ss')} ${memoryMessage}${str}`);
}
