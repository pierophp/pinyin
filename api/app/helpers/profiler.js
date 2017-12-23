const moment = require('moment');

module.exports = function profiler(str, forceOnProduction) {
  if (process.env.NODE_ENV === 'production' && forceOnProduction !== true) {
    return;
  }

  const memoryUsage = parseFloat(
    process.memoryUsage().heapUsed / 1024 / 1024,
  ).toFixed(2);
  const memoryTotal = parseFloat(
    process.memoryUsage().heapTotal / 1024 / 1024,
  ).toFixed(2);
  const memoryRSS = parseFloat(process.memoryUsage().rss / 1024 / 1024).toFixed(
    2,
  );
  // eslint-disable-next-line
  console.log(
    `${moment().format(
      'HH:mm:ss',
    )} - Mem RSS ${memoryUsage}MB - Mem Tot ${memoryTotal}MB - Mem Usag ${memoryRSS}MB ${str}`,
  );
};
