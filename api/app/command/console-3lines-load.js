const program = require('commander');
const fs = require('fs');
const wget = require('wget');
const ThreeLinesDatabaseParser = require('../services/ThreeLinesDatabaseParser');
const env = require('../../env');

program.parse(process.argv);

let storagePath = `${__dirname}/../storage/`;
if (env.storage_path) {
  storagePath = env.storage_path;
}

const filename = `${storagePath}DicPortugues.txt`;

const importFile = function importFile() {
  ThreeLinesDatabaseParser.loadFile(filename)
    .then(() => {
      // eslint-disable-next-line
      console.log('Successfully imported!');
      process.exit();
    })
    .error(() => {
      // eslint-disable-next-line
      console.log('Error!');
      process.exit();
    });
};

const downloadFile = function downloadFile() {
  const src =
    'http://1914:144000@www.3lines.org/languages/portuguese/DicPortugues.txt';

  const download = wget.download(src, filename);

  download.on('error', err => {
    // eslint-disable-next-line
    console.log(`Error: ${err}`);
  });

  download.on('end', () => {
    importFile();
  });
};

try {
  fs.statSync(filename);
  importFile();
} catch (e) {
  downloadFile();
}
