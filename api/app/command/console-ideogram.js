const program = require('commander');
const UnihanDatabaseParser = require('../services/UnihanDatabaseParser');

program.option('-p, --pinyin [type]', 'Pinyin');
program.option('-i, --ideogram [type]', 'Ideogram');
program.option('-d, --definition [type]', 'Definition');
program.parse(process.argv);

UnihanDatabaseParser.saveWord(
  program.pinyin,
  program.ideogram,
  program.definition,
).then(() => {
  process.exit();
});
