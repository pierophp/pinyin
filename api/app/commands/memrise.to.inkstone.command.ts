import { Argv, CommandModule } from 'yargs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
// @ts-ignore
import * as UnihanSearch from '../services/UnihanSearch';
import * as fs from 'fs-extra';
import { pinyinAccentsToNumbers } from '../helpers/pinyin.accents.to.numbers';

const ideogramsConverter = new IdeogramsConverter();

export class MemriseToInkstoneCommand implements CommandModule {
  public command = 'memrisetoinkstone';
  public describe = 'Memrise to Inkstone';

  public async handler(argv: Argv) {
    const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    for (const chapter of chapters) {
      const book = 2;
      const url = `https://www.memrise.com/course/947655/a-course-in-contemporary-chinese-2-2/${chapter}/`;

      const filename = `contemporary-chinese-B${book}L${chapter
        .toString()
        .padStart(2, '0')}.list`;

      let response = await axios.get(url);

      let $ = cheerio.load(response.data);

      const items = $('.container .things .thing');

      let result = '';

      const ideogramList: any[] = [];

      items.each((i, item) => {
        let ideogram = '';
        let meaning = '';

        $(item)
          .find('.col_a .text')
          .each((k, text) => {
            ideogram = $(text)
              .text()
              .replace('(', '')
              .replace(')', '')
              .trim();
          });

        $(item)
          .find('.col_b .text')
          .each((k, text) => {
            meaning = $(text).text();
          });

        ideogramList.push({ ideogram, meaning });
      });

      for (const ideogram of ideogramList) {
        result +=
          (await ideogramsConverter.traditionalToSimplified(
            ideogram.ideogram,
          )) + '\t';
        result += ideogram.ideogram + '\t';

        const pinyin = (await UnihanSearch.toPinyin(ideogram.ideogram))
          .map(item => {
            return pinyinAccentsToNumbers(item.pinyin);
          })
          .join(' ');

        result += pinyin + '\t';

        result += `/${ideogram.meaning.replace(/;/g, '/')}/`;
        result += '\n';
      }

      await fs.writeFile(
        __dirname + `/../../../api/app/data/tmp/${filename}`,
        result,
      );
    }

    process.exit();
  }
}
