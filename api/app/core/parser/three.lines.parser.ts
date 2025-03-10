import { createReadStream } from 'fs';
import * as readline from 'readline';
import * as replaceall from 'replaceall';
import { pinyinNumbersToAccents } from '../../helpers/pinyin.numbers.to.accents';
import * as knex from '../../services/knex';
import { IdeogramsConverter } from '../converter/ideograms.converter';

let storagePath = `${__dirname}/../../../../storage/`;

const storagePathEnv = process.env['STORAGE_PATH'];
if (storagePathEnv) {
  storagePath = storagePathEnv;
}

const filename = `${storagePath}Spanish-Pinyin.txt`;
const promises: Function[] = [];

const ideogramsConverter = new IdeogramsConverter();

export class ThreeLinesParser {
  protected words: any = {};

  public async parse() {
    await this.import();
  }

  protected async import() {
    console.info('Create table start');

    await knex.raw(`DROP TABLE IF EXISTS tmp_three_lines`);
    await knex.raw(`
        CREATE TABLE tmp_three_lines (
            id int(10) NOT NULL AUTO_INCREMENT,
            ideogram varchar(190),
            ideogram_raw varchar(190),
            pronunciation varchar(190) CHARACTER SET utf8 COLLATE utf8_bin,
            pronunciation_unaccented varchar(190),
            pronunciation_case varchar(190) CHARACTER SET utf8 COLLATE utf8_bin,
            pronunciation_case_unaccented varchar(190),
            pronunciation_spaced varchar(190) CHARACTER SET utf8 COLLATE utf8_bin,
            definition text,
            variants text,
            simplified tinyint(1),
            traditional tinyint(1),
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await knex.raw(`
      ALTER TABLE tmp_three_lines ADD INDEX tmp_three_lines_ideogram_index (ideogram ASC)
    `);

    await knex.raw(`
      ALTER TABLE tmp_three_lines ADD INDEX tmp_three_lines_pronunciation_index (pronunciation ASC)
    `);

    console.info('Create table end');

    await new Promise((resolve) => {
      const lineReader = readline.createInterface({
        input: createReadStream(filename),
      });

      lineReader.on('line', (line) => {
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
          resolve(undefined);
        });
      });
    });
  }

  protected readLine(line): null | Function {
    if (!line) {
      return null;
    }

    let parts = line.split('\t');
    let ideogram = parts[1];
    let ideogramTraditional = parts[0];

    let pronunciation = '';
    let pronunciationSpaced = '';

    if (parts[2] === 'Romanization') {
      return null;
    }

    if (!parts[2]) {
      console.log(ideogram);
      return null;
    }

    const pronunciationList = parts[2].split(' ');

    const vogals = ['a', 'e', 'o'];
    pronunciationList.forEach((p, index) => {
      if (index > 0) {
        if (vogals.indexOf(p[0]) > -1) {
          p = "'" + p;
        }
      }

      p = replaceall('v', 'ü', p);

      pronunciation += p;
      if (pronunciationSpaced) {
        pronunciationSpaced += ' ';
      }
      pronunciationSpaced += p;
    });

    const pronunciationUnaccented = pronunciation.replace(
      new RegExp('[12345]', 'g'),
      '',
    );

    pronunciation = pinyinNumbersToAccents(pronunciation);
    pronunciationSpaced = pinyinNumbersToAccents(pronunciationSpaced);

    const importPromise = async () => {
      const descriptions: string[] = parts[3].split('/');
      let variants: string[] = [];

      const ideogramRaw = ideogram;
      const ideogramTraditionalRaw = ideogramTraditional;
      ideogram = ideogramsConverter.convertIdeogramsToUtf16(ideogram);
      ideogramTraditional =
        ideogramsConverter.convertIdeogramsToUtf16(ideogramTraditional);

      let traditional = 0;
      variants.push(ideogramTraditionalRaw);

      const toInsert = {
        ideogram,
        ideogram_raw: ideogramRaw,
        pronunciation: pronunciation.toLowerCase(),
        pronunciation_unaccented: pronunciationUnaccented.toLowerCase(),
        pronunciation_case: pronunciation,
        pronunciation_case_unaccented: pronunciationUnaccented,
        pronunciation_spaced: pronunciationSpaced,
        definition: descriptions,
        simplified: 1,
        traditional,
        variants,
      };

      let key = `${ideogramRaw}${pronunciation}${traditional}`;

      if (this.words[key]) {
        this.words[key].variants = JSON.parse(
          JSON.stringify(this.words[key].variants.concat(variants)),
        );

        this.words[key].definition =
          this.words[key].definition.concat(descriptions);
      } else {
        this.words[key] = JSON.parse(JSON.stringify(toInsert));
      }

      traditional = 1;

      key = `${ideogramTraditionalRaw}${pronunciation}${traditional}`;

      variants = [];
      variants.push(ideogramRaw);

      toInsert.ideogram = ideogramTraditional;
      toInsert.ideogram_raw = ideogramTraditionalRaw;
      toInsert.simplified = 0;
      toInsert.traditional = traditional;
      toInsert.variants = JSON.parse(JSON.stringify(variants));

      if (this.words[key]) {
        this.words[key].variants = JSON.parse(
          JSON.stringify(this.words[key].variants.concat(variants)),
        );

        this.words[key].definition = JSON.parse(
          JSON.stringify(this.words[key].definition.concat(descriptions)),
        );
      } else {
        this.words[key] = JSON.parse(JSON.stringify(toInsert));
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
      if (i % 1000 === 0) {
        console.log(i);
      }

      await promiseImport();
    }

    i = 0;
    console.log('Start store database');
    for (const wordKey of Object.keys(this.words)) {
      const word = this.words[wordKey];

      i += 1;
      if (i % 1000 === 0) {
        console.log(i);
      }

      let variantsSave = Array.from(new Set(word.variants));
      if (variantsSave.length === 1 && word.ideogram_raw === variantsSave[0]) {
        variantsSave = [];
      }

      word.variants = JSON.stringify(variantsSave);
      word.definition = JSON.stringify(Array.from(new Set(word.definition)));

      try {
        await knex('tmp_three_lines').insert(word);
      } catch (e) {
        word.ideogram_raw = null;
        await knex('tmp_three_lines').insert(word);
      }
    }

    console.log('Joining simplified and traditional');

    await knex.raw(`
      UPDATE tmp_three_lines ts
      JOIN tmp_three_lines tt
        ON tt.ideogram = ts.ideogram
      AND tt.pronunciation_case = ts.pronunciation_case
      AND tt.definition = ts.definition
      AND tt.variants = ts.variants
      AND tt.simplified = 0
      AND tt.traditional = 1
      SET ts.traditional = 1
      WHERE ts.simplified = 1
        AND ts.traditional = 0
    `);

    await knex.raw(`
      DELETE tt
      FROM tmp_three_lines ts
      JOIN tmp_three_lines tt
        ON tt.ideogram = ts.ideogram
      AND tt.pronunciation_case = ts.pronunciation_case
      AND tt.definition = ts.definition
      AND tt.variants = ts.variants
      AND tt.simplified = 0
      AND tt.traditional = 1
      WHERE ts.simplified = 1
        AND ts.traditional = 1
    `);
  }
}
