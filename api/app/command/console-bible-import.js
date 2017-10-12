const program = require('commander');
const ImportBible = require('../services/ImportBible');

program.parse(process.argv);

ImportBible.import().then(() => {
  process.exit();
});
