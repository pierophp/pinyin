import { format } from 'https://deno.land/std@0.147.0/datetime/mod.ts';
import { config } from 'https://deno.land/x/dotenv/mod.ts';

export function profiler(str: string, forceOnProduction?: boolean) {
  const env = config({ safe: true });
  if (env.PROFILER_ENABLED !== '1' || forceOnProduction !== true) {
    return;
  }

  let memoryMessage = '';
  if (env.PROFILER_SHOW_MEMORY === '1') {
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
