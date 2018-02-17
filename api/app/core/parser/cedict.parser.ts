import * as AdmZip from 'adm-zip';
import { createReadStream, statSync } from 'fs';
import * as readline from 'readline';
import * as replaceall from 'replaceall';
import * as wget from 'wget';
import { IdeogramsConverter } from '../converter/ideograms.converter';
import { PinyinConverter } from '../converter/pinyin.converter';
import * as env from '../../../env';
import * as knex from '../../services/knex';

let storagePath = `${__dirname}/../../../storage/`;
if (env.storage_path) {
  storagePath = env.storage_path;
}

const filename = `${storagePath}cedict_ts.u8`;
const filenameZip = `${storagePath}cedict_1_0_ts_utf-8_mdbg.zip`;
const promises: Function[] = [];

const ideogramsConverter = new IdeogramsConverter();
const pinyinConverter = new PinyinConverter();

export class CedictParser {
  public async parse() {
    try {
      statSync(filename);
    } catch (e) {
      try {
        statSync(filenameZip);
      } catch (e) {
        await this.download();
      }

      await this.unzip();
    }

    await this.import();
  }

  protected async download() {
    const src =
      'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip';

    const download = wget.download(src, filenameZip);

    console.info('Download start');

    await new Promise((resolve, reject) => {
      download.on('error', err => {
        // eslint-disable-next-line
        console.log(`Error: ${err}`);
        reject(err);
      });

      download.on('end', () => {
        console.info('Download end');
        resolve();
      });
    });
  }

  protected async unzip() {
    const zip = new AdmZip(filenameZip);

    console.info('Unzip start');
    zip.extractAllTo(storagePath, true);
    console.info('Unzip end');
  }

  protected async import() {
    console.info('Create table start');

    await knex.raw(`DROP TABLE IF EXISTS tmp_cedict`);
    await knex.raw(`
        CREATE TABLE tmp_cedict (
            id int(10) NOT NULL AUTO_INCREMENT,
            ideogram varchar(255),
            ideogram_raw varchar(255),
            pronunciation varchar(255),
            pronunciation_unaccented varchar(255),
            pronunciation_case varchar(255),
            pronunciation_case_unaccented varchar(255),
            definition text,
            measure_words text,
            variants text,
            simplified tinyint(1),
            traditional tinyint(1),
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    `);

    console.info('Create table end');

    await new Promise(resolve => {
      const lineReader = readline.createInterface({
        input: createReadStream(filename),
      });

      lineReader.on('line', line => {
        if (line[0] === '#') {
          return;
        }

        const importPromisse = this.readLine(line);
        if (!importPromisse) {
          return;
        }

        promises.push(importPromisse);
        return;
      });

      lineReader.on('close', () => {
        console.info('Process promise start');
        this.processPromisses().then(() => {
          console.info('Process promise end');
          resolve();
        });
      });
    });
  }

  protected readLine(line): null | Function {
    if (!line) {
      return null;
    }

    let parts = line.split('/');
    const ideogramParts = parts[0].split(' ');
    let ideogram = ideogramParts[1];
    let ideogramTraditional = ideogramParts[0];

    parts = line.split('/');

    let pronunciation = '';
    const pronunciationList = parts[0]
      .split('[')[1]
      .replace(']', '')
      .split(' ');

    const vogals = ['a', 'e', 'o'];
    pronunciationList.forEach((p, index) => {
      if (index > 0) {
        if (vogals.indexOf(p[0]) > -1) {
          pronunciation += "'";
        }
      }
      pronunciation += p;
    });

    pronunciation = replaceall('u:', 'ü', pronunciation);

    const pronunciationUnaccented = pronunciation.replace(
      new RegExp('[12345]', 'g'),
      '',
    );

    pronunciation = pinyinConverter.tonesNumbersToAccents(pronunciation);

    const importPromise = async () => {
      parts.shift();
      const descriptions: string[] = [];
      const measureWords: string[] = [];
      let variants: string[] = [];

      for (const part of parts) {
        if (part.substr(0, 3) !== 'CL:') {
          if (part) {
            descriptions.push(part);
          }

          continue;
        }

        const measureWordsTmp = part.replace('CL:', '').split(',');
        for (let measureWord of measureWordsTmp) {
          measureWord = measureWord.split('[')[0].split('|');
          if (measureWord[1] !== undefined) {
            measureWord = measureWord[1];
          } else {
            measureWord = measureWord[0];
          }

          measureWords.push(measureWord);
        }
      }

      console.log(ideogram);

      const ideogramRaw = ideogram;
      const ideogramTraditionalRaw = ideogramTraditional;
      ideogram = ideogramsConverter.convertIdeogramsToUtf16(ideogram);
      ideogramTraditional = ideogramsConverter.convertIdeogramsToUtf16(
        ideogramTraditional,
      );

      let traditional = 0;
      if (ideogramTraditional === ideogram) {
        traditional = 1;
      } else {
        variants.push(ideogramTraditional);
      }

      const toInsert = {
        ideogram,
        ideogram_raw: ideogramRaw,
        pronunciation: pronunciation.toLowerCase(),
        pronunciation_unaccented: pronunciationUnaccented.toLowerCase(),
        pronunciation_case: pronunciation,
        pronunciation_case_unaccented: pronunciationUnaccented,
        definition: JSON.stringify(descriptions),
        measure_words: JSON.stringify(measureWords),
        simplified: 1,
        traditional,
        variants: JSON.stringify(variants),
      };

      await knex('tmp_cedict').insert(toInsert);

      if (ideogramTraditional !== ideogram) {
        variants = [];
        variants.push(ideogram);

        toInsert.ideogram = ideogramTraditional;
        toInsert.ideogram_raw = ideogramTraditionalRaw;
        toInsert.simplified = 0;
        toInsert.traditional = 1;
        toInsert.variants = JSON.stringify(variants);

        await knex('tmp_cedict').insert(toInsert);
      }
    };

    return importPromise;
  }

  protected async processPromisses() {
    // eslint-disable-next-line
    console.log('Promise process init');
    let i = 0;
    for (const promiseImport of promises) {
      i += 1;
      console.log(i);
      await promiseImport();
    }
  }
}
