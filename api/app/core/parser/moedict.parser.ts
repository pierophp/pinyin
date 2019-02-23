import * as bluebird from 'bluebird';
import { remove as removeDiacritics } from 'diacritics';
import { IdeogramsConverter } from '../../core/converter/ideograms.converter';
import { PinyinConverter } from '../../core/pinyin/pinyin.converter';
import { separateWords } from '../../helpers/separate.words';
import * as knex from '../../services/knex';

/**
 * git@github.com:g0v/moedict-data.git
 */
export class MoedictParser {
  private dictionaryParsed = {};
  private ignoreWithoutPinyin = true;

  private ideogramsConverter: IdeogramsConverter;
  private pinyinConverter: PinyinConverter;

  constructor() {
    this.ideogramsConverter = new IdeogramsConverter();
    this.pinyinConverter = new PinyinConverter();
  }

  public async parse() {
    const filename = __dirname + '/../../../../moedict-data/dict-revised.json';

    const entries = await require(filename);

    const limit = 2000 * 100;

    await this.createTable();

    await bluebird.map(
      entries.slice(0, limit),
      async (entry: any) => {
        await this.parseEntry(entry);
      },
      {
        concurrency: 10,
      },
    );

    for (const key of Object.keys(this.dictionaryParsed)) {
      const entry = this.dictionaryParsed[key];
      await knex('moedict').insert({
        ideogram: entry.character,
        ideogram_original: entry.characterOriginal,
        ideogram_simplified: entry.characterSimplified,
        pronunciation_case: entry.pronunciation
          ? entry.pronunciation.split(' ').join('')
          : null,
        pronunciation_unaccented: entry.pronunciation
          ? removeDiacritics(entry.pronunciation)
          : null,
        pronunciation_case_unaccented: entry.pronunciation
          ? removeDiacritics(entry.pronunciation)
          : null,
        pronunciation_spaced: entry.pronunciation,
        stroke_count: entry.strokeCount,
        definition: JSON.stringify({
          traditionalDefinitions: entry.traditionalDefinitions,
          simplifiedDefinitions: entry.simplifiedDefinitions,
          pinyinDefinitions: entry.pinyinDefinitions,
        }),
      });
    }
  }

  public async convertToPinyin(traditionalDefinition: any) {
    let pinyinDefinition = {};

    const keys = Object.keys(traditionalDefinition);
    for (const key of keys) {
      if (!traditionalDefinition[key]) {
        continue;
      }

      if (Array.isArray(traditionalDefinition[key])) {
        pinyinDefinition[key] = [];
        for (const entry of traditionalDefinition[key]) {
          pinyinDefinition[key].push(
            (await this.pinyinConverter.toPinyin(separateWords(entry))).map(
              item => item.pinyin,
            ),
          );
        }
      } else {
        pinyinDefinition[key] = (await this.pinyinConverter.toPinyin(
          separateWords(traditionalDefinition[key]),
        )).map(item => item.pinyin);
      }
    }

    return pinyinDefinition;
  }

  public async convertToSimplified(traditionalDefinition: any) {
    let simplifiedDefinition = {};

    const keys = Object.keys(traditionalDefinition);
    for (const key of keys) {
      if (!traditionalDefinition[key]) {
        continue;
      }

      if (Array.isArray(traditionalDefinition[key])) {
        simplifiedDefinition[key] = [];
        for (const entry of traditionalDefinition[key]) {
          simplifiedDefinition[key].push(
            await this.ideogramsConverter.traditionalToSimplified(entry),
          );
        }
      } else {
        simplifiedDefinition[
          key
        ] = await this.ideogramsConverter.traditionalToSimplified(
          traditionalDefinition[key],
        );
      }
    }

    return simplifiedDefinition;
  }

  public async parseEntry(entry: any) {
    let character = entry.title;
    let characterOriginal = entry.title;

    if (character.indexOf('{') !== -1) {
      const items = character.split(/[\{\}]/).filter(item => item);

      let newCharacters = '';
      for (const item of items) {
        if (item.substr(0, 1) === '[') {
          newCharacters += String.fromCodePoint(
            parseInt(item.substr(1, item.length - 2), 16),
          );
        } else {
          newCharacters += item;
        }
      }

      character = newCharacters;
    }

    const strokeCount = entry.stroke_count;
    for (const heteronym of entry.heteronyms) {
      const pronunciation = heteronym.pinyin;

      if (!pronunciation && this.ignoreWithoutPinyin) {
        continue;
      }

      const key = `${character}_${pronunciation}`;

      const traditionalDefinitions: any[] = [];
      const simplifiedDefinitions: any[] = [];
      const pinyinDefinitions: any[] = [];

      for (const definition of heteronym.definitions) {
        const traditionalDefinition = {
          def: definition.def,
          quote: definition.quote, // list
          type: definition.type,
          link: definition.link, // list
          example: definition.example, // list
          antonyms: definition.antonyms ? definition.antonyms : undefined,
          synonyms: definition.synonyms ? definition.synonyms : undefined,
        };

        traditionalDefinitions.push(traditionalDefinition);
        simplifiedDefinitions.push(
          await this.convertToSimplified(traditionalDefinition),
        );
        pinyinDefinitions.push(
          await this.convertToPinyin(traditionalDefinition),
        );
      }

      const characterSimplified = await this.ideogramsConverter.traditionalToSimplified(
        character,
      );

      this.dictionaryParsed[key] = {
        character,
        characterOriginal,
        characterSimplified,
        pronunciation,
        strokeCount,
        traditionalDefinitions,
        simplifiedDefinitions,
        pinyinDefinitions,
      };
    }
  }

  public async createTable() {
    await knex.raw(`DROP TABLE IF EXISTS moedict`);
    await knex.raw(`
        CREATE TABLE moedict (
            id int(10) NOT NULL AUTO_INCREMENT,
            ideogram_original varchar(190),
            ideogram varchar(190),
            ideogram_simplified varchar(190),
            stroke_count INT(10),
            pronunciation_unaccented varchar(190),
            pronunciation_case varchar(190) CHARACTER SET utf8 COLLATE utf8_bin,
            pronunciation_case_unaccented varchar(190),
            pronunciation_spaced varchar(190) CHARACTER SET utf8 COLLATE utf8_bin,
            definition json,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await knex.raw(`
          ALTER TABLE moedict
          ADD INDEX idx_ideogram (ideogram ASC) VISIBLE,
          ADD INDEX idx_ideogram_simplified (ideogram_simplified ASC) VISIBLE
    `);
  }
}
