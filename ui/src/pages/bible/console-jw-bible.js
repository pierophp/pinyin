const program = require('commander');
const JWDownloader = require('../services/JWDownloader');

program.parse(process.argv);

JWDownloader.getBibleNames().then(() => {
  process.exit();
});
