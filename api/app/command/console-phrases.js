const program = require('commander');
const { CjkRepository } = require('../repository/cjk.repository');

program.parse(process.argv);

CjkRepository.referencePhrases().then(() => {
  process.exit();
});
