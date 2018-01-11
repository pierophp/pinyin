const program = require('commander');
const { CjkRepository } = require('../repository/CjkRepository');

program.parse(process.argv);

CjkRepository.referencePhrases().then(() => {
  process.exit();
});
