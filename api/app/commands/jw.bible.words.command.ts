import axios from 'axios';
import * as bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import * as fs from 'fs-extra';
import { Arguments, CommandModule } from 'yargs';

export class JwBibleWordsCommand implements CommandModule {
  public command = 'jw:bible-words';
  public describe = 'JW Bible Import';

  public async handler(argv: Arguments) {
    const dirname = `${__dirname}/../../../storage/`;
    const urlBible =
      'https://www.jw.org/cmn-hans/%E5%87%BA%E7%89%88%E7%89%A9/%E5%9C%A3%E7%BB%8F/nwt/%E5%9C%A3%E7%BB%8F%E5%8D%B7%E7%9B%AE';
    let response = await axios.get(urlBible);

    let $ = cheerio.load(response.data);
    const bibles: any[] = [];
    $('.bibleBook .fullName').each((i, bibleChildren) => {
      bibles.push(
        $(bibleChildren)
          .text()
          .trim(),
      );
    });

    const words = {};
    const wordsVerses: any[] = [];

    await bluebird.mapSeries(bibles, async bible => {
      const urlChapter = `${urlBible}/${encodeURIComponent(bible)}/`;
      response = await axios.get(urlChapter);
      $ = cheerio.load(response.data);
      const chapters: any[] = [];
      $('.chapters .chapter').each((j, bibleChapterChildren) => {
        chapters.push(
          $(bibleChapterChildren)
            .text()
            .trim(),
        );
      });
      // eslint-disable-next-line
      console.log(bible);
      await bluebird.mapSeries(chapters, async chapter => {
        // eslint-disable-next-line
        console.log(chapter);
        const url = `${urlChapter}/${chapter}/`;
        try {
          response = await axios.get(url);
        } catch (e) {
          // eslint-disable-next-line
          console.log(e);
          // eslint-disable-next-line
          console.log(url);
          throw e;
        }
        $ = cheerio.load(response.data);

        $('#bibleText .verse').each((i, children) => {
          let verse = $(children)
            .find('.verseNum')
            .text()
            .trim();
          if (!verse) {
            verse = '1';
          }

          $(children)
            .find('u')
            .each((j, subChildren) => {
              const word = $(subChildren)
                .text()
                .trim();

              if (words[word] === undefined) {
                words[word] = 0;
              }
              wordsVerses.push({
                bible,
                chapter,
                verse,
                word,
              });

              words[word] += 1;
            });
        });
      });
    });

    let csvBible = 'bible;chapter;verse;word\n';
    wordsVerses.forEach(wordVerse => {
      csvBible += `${wordVerse.bible};${wordVerse.chapter};${wordVerse.verse};${
        wordVerse.word
      }\n`;
    });

    const filenameBible = `${dirname}bible_words.csv`;
    await fs.writeFile(filenameBible, csvBible);

    let csvBibleTotal = 'word;total\n';
    Object.keys(words).forEach(key => {
      csvBibleTotal += `${key};${words[key]}\n`;
    });

    const filenameBibleTotal = `${dirname}bible_total.csv`;
    await fs.writeFile(filenameBibleTotal, csvBibleTotal);

    process.exit();
  }
}
