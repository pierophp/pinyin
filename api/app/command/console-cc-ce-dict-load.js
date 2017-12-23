const program = require('commander');
const CcCeDictDatabaseParser = require('../services/CcCeDictDatabaseParser');
const fs = require('fs');
const wget = require('wget');
const AdmZip = require('adm-zip');
const env = require('../../env');

program.parse(process.argv);

let storagePath = `${__dirname}/../../storage/`;
if (env.storage_path) {
  storagePath = env.storage_path;
}

const filename = `${storagePath}cedict_ts.u8`;
const filenameZip = `${storagePath}cedict_1_0_ts_utf-8_mdbg.zip`;

const importFile = function importFile() {
  CcCeDictDatabaseParser.loadFile(filename)
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
    'http://www.mdbg.net/chindict/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip';

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
