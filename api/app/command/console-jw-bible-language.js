const program = require('commander');
const JWDownloader = require('../services/JWDownloader');

program.parse(process.argv);

JWDownloader.getLanguageBible().then(() => {
  process.exit();
});
