
const program = require('commander');

// eslint-disable-next-line
console.log(`Running on ENV: ${process.env.NODE_ENV}`);

require('events').EventEmitter.defaultMaxListeners = Infinity;

program
  .version('0.0.1')
  .command('ideogram', 'Create a ideogram to pinyin database');

program
  .version('0.0.1')
  .command('unihan-load', 'Unihan load');

program
  .version('0.0.1')
  .command('tatoeba-load', 'Tatoeba load');

program
  .version('0.0.1')
  .command('tatoeba-references', 'Tatoeba references');

program
  .version('0.0.1')
  .command('phrases', 'Phrases');

program
  .version('0.0.1')
  .command('cc-ce-dict-load', 'CC CE Dict load');

program
  .version('0.0.1')
  .command('3lines-load', '3 Lines load');

program
  .version('0.0.1')
  .command('jw-track', 'JW Track');

program
  .version('0.0.1')
  .command('jw-bible', 'JW Bible');

program
  .version('0.0.1')
  .command('jw-bible-pinyin', 'JW Bible Pinyin');

program
  .version('0.0.1')
  .command('jw-bible-traditional', 'JW Bible Traditional');

program
  .version('0.0.1')
  .command('jw-insight', 'JW Insight');

program
  .version('0.0.1')
  .command('hsk-import', 'HSK Import');

program
  .version('0.0.1')
  .command('export-pleco', 'Export Pleco');

program
  .version('0.0.1')
  .command('export-pinyin', 'Export Pinyin');

program
  .version('0.0.1')
  .command('bible-import', 'Import Bible');

program.parse(process.argv);
