import * as bluebird from 'bluebird';
import { IdeogramsConverter } from '../../core/converter/ideograms.converter';
import { separateWords } from '../../helpers/separate.words';
import { PinyinConverter } from '../../core/pinyin/pinyin.converter';

/**
 * git@github.com:g0v/moedict-data.git
 */
export class MoedictParser {
  private dictionaryParsed = {};

  private ideogramsConverter: IdeogramsConverter;
  private pinyinConverter: PinyinConverter;

  constructor() {
    this.ideogramsConverter = new IdeogramsConverter();
    this.pinyinConverter = new PinyinConverter();
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
            await this.pinyinConverter.toPinyin(separateWords(entry)),
          );
        }
      } else {
        pinyinDefinition[key] = await this.pinyinConverter.toPinyin(
          separateWords(traditionalDefinition[key]),
        );
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
    const character = entry.title;
    const strokeCount = entry.stroke_count;
    for (const heteronym of entry.heteronyms) {
      const pronunciation = heteronym.pinyin;

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
          antonyms: definition.antonyms
            ? definition.antonyms.split(',')
            : undefined,
          synonyms: definition.synonyms
            ? definition.synonyms.split(',')
            : undefined,
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
        characterSimplified,
        pronunciation,
        strokeCount,
        traditionalDefinitions,
        simplifiedDefinitions,
        pinyinDefinitions,
      };
    }
  }

  public async parse() {
    // const filename = __dirname + '/../../../../moedict-data/dict-revised.json';
    const filename = __dirname + '/../../../../moe/exemplos.json';

    const entries = await require(filename);

    await bluebird.map(
      entries,
      async (entry: any) => {
        await this.parseEntry(entry);
      },
      {
        concurrency: 10,
      },
    );

    console.log(JSON.stringify(this.dictionaryParsed, null, 2));
  }
}
