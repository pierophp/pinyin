import * as moment from 'moment';

export function profiler(str: string, forceOnProduction?: boolean) {
  if (process.env.NODE_ENV === 'production' && forceOnProduction !== true) {
    return;
  }

  let memoryMessage = '';
  if (process.env.PROFILER_SHOW_MEMORY) {
    const memoryUsage = parseFloat(
      (process.memoryUsage().heapUsed / 1024 / 1024).toString(),
    ).toFixed(2);

    const memoryTotal = parseFloat(
      (process.memoryUsage().heapTotal / 1024 / 1024).toString(),
    ).toFixed(2);

    const memoryRSS = parseFloat(
      (process.memoryUsage().rss / 1024 / 1024).toString(),
    ).toFixed(2);

    memoryMessage = `- Mem RSS ${memoryUsage}MB - Mem Tot ${memoryTotal}MB - Mem Usag ${memoryRSS}MB `;
  }

  // eslint-disable-next-line
  console.log(`${moment().format('HH:mm:ss')} ${memoryMessage}${str}`);
}
