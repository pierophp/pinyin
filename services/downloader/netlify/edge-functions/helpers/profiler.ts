import { format } from 'https://deno.land/std@0.147.0/datetime/mod.ts';

export function profiler(str: string, forceOnProduction?: boolean) {
  if (process.env.NODE_ENV === 'production' && forceOnProduction !== true) {
    return;
  }

  let memoryMessage = '';
  if (process.env.PROFILER_SHOW_MEMORY) {
    const memoryUsage = Deno.memoryUsage();

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
