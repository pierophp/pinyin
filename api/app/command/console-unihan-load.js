const UnihanDatabaseParser = require('../services/UnihanDatabaseParser');
const program = require('commander');
const wget = require('wget');
const AdmZip = require('adm-zip');
const env = require('../../env');
const fs = require('fs');

program.parse(process.argv);

let storagePath = `${__dirname}/../storage/`;
if (env.storage_path) {
  storagePath = env.storage_path;
}

const filename = `${storagePath}ucd.unihan.flat.xml`;
const filenameZip = `${storagePath}ucd.unihan.flat.zip`;

const importFile = function importFile() {
  UnihanDatabaseParser.loadFile(filename)
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

const unzipFile = function unzipFile() {
  const zip = new AdmZip(filenameZip);
  zip.extractAllTo(storagePath, true);
  importFile();
};

const downloadFile = function downloadFile() {
  const src =
    'http://www.unicode.org/Public/UCD/latest/ucdxml/ucd.unihan.flat.zip';

  try {
    fs.statSync(filenameZip);
    fs.unlinkSync(filenameZip);
  } catch (e) {
    // just ignore
  }

  const download = wget.download(src, filenameZip);

  download.on('error', err => {
    // eslint-disable-next-line
    console.log(`Error: ${err}`);
  });

  download.on('end', () => {
    unzipFile();
  });
};

try {
  fs.statSync(filename);
  importFile();
} catch (e) {
  downloadFile();
}
