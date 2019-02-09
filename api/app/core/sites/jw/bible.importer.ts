import axios from 'axios';
import * as bluebird from 'bluebird';
import * as cheerio from 'cheerio';
import { ensureDir, readFile, stat, writeFile } from 'fs-extra';
import * as replaceall from 'replaceall';
import * as bibleBooks from '../../../../../shared/data/bible/bible';
import * as bibleChapters from '../../../../../shared/data/bible/chapters';
import { BlockInterface } from '../../../core/interfaces/block.interface';
import { Encoder } from '../encoder';
import { RubyParser } from './parser/ruby.parser';

export class BibleImporter {
  protected rubyParser: RubyParser;

  constructor() {
    this.rubyParser = new RubyParser();
  }

  protected baseUrl = 'https://wol.jw.org';
  public async import() {
    const booksUrl = `${
      this.baseUrl
    }/cmn-Hans/wol/binav/r23/lp-chs-rb/bi12/CHS/2001`;

    let response = await axios.get(booksUrl);
    let $ = cheerio.load(response.data);

    const books = $('.books .book .bookLink').toArray();
    let bookId = 0;

    for (const book of books) {
      const newBook = $(book).find('ruby');

      newBook.find('rt').remove();

      await this.parseBook($(book).attr('href'), $(newBook).text(), bookId);

      bookId++;
    }
  }

  public async parseBook(
    url: string,
    book: string,
    bookId: number,
  ): Promise<void> {
    const chaptersUrl = `${this.baseUrl}${url}`;

    let response = await axios.get(chaptersUrl);
    let $ = cheerio.load(response.data);

    const chapters = $('.chapters .chapter a').toArray();
    for (const chapter of chapters) {
      await this.parseChapter(
        $(chapter).attr('href'),
        book,
        bookId,
        $(chapter).text(),
      );
    }
  }

  public async parseChapter(
    url: string,
    book: string,
    bookId: number,
    chapter: string,
  ): Promise<void> {
    const chapterUrl = `${this.baseUrl}${url}`;

    let response = await axios.get(chapterUrl);
    let $ = cheerio.load(response.data, { decodeEntities: false });

    $('a.b[data-bid]').remove();
    $('p.ss').remove();
    $('a.pr').remove();

    const lines = $('article p').toArray();
    const linesResponse: any[] = [];

    const bookEnglish = Object.keys(bibleChapters)[bookId];

    for (const line of lines) {
      let lineResponse: BlockInterface[] = [];
      const verses = $(line)
        .find('span.v')
        .toArray();

      for (const verse of verses) {
        const verseId = $(verse)
          .attr('id')
          .split('-')[2];

        const verseParsed = await this.rubyParser.parse(
          {
            chinese: {
              text: $(verse).html()!,
            },
          },
          false,
        );

        if (verseParsed) {
          if (linesResponse.length || lineResponse.length) {
            delete verseParsed[0].line;
          }

          verseParsed[0].v = parseInt(verseId, 10);
          lineResponse = lineResponse.concat(verseParsed);
        }
      }

      linesResponse.push(lineResponse);
    }

    const baseDirectory = `${__dirname}/../../../../../bible-pinyin/cmn-hans/`;

    await ensureDir(`${baseDirectory}${bookEnglish}`);
    await writeFile(
      `${baseDirectory}${bookEnglish}/${chapter}.json`,
      JSON.stringify({ lines: linesResponse }),
    );
  }

  public async getTraditionalBible() {
    const encoder = new Encoder();
    const urlBible = 'https://www.jw.org/cmn-hant/出版物/聖經/bi12/聖經經卷/';
    let response = await axios.get(encoder.encodeUrl(urlBible));
    let $ = cheerio.load(response.data);
    let bibles: any[] = []; // '雅各書'

    if (bibles.length === 0) {
      $('.bibleBook .fullName').each((i, bibleChildren) => {
        bibles.push(
          $(bibleChildren)
            .text()
            .trim(),
        );
      });
    }

    await bluebird.mapSeries(bibles, async bible => {
      const urlChapter = `${urlBible}${bible}/`;
      response = await axios.get(encoder.encodeUrl(urlChapter));
      $ = cheerio.load(response.data);
      const chapters: any[] = [];
      $('.chapters .chapter').each((j, bibleChapterChildren) => {
        chapters.push(
          $(bibleChapterChildren)
            .text()
            .trim(),
        );
      });

      const bibleEnglish = Object.keys(bibleChapters)[bibleBooks[bible] - 1];
      const onlyNotExists = true;

      // eslint-disable-next-line
      console.log(bible);
      // eslint-disable-next-line
      console.log(bibleEnglish);

      const biblePath = `${__dirname}/../../../../../bible-pinyin/cmn-hans/`;

      const biblePathTraditional = `${__dirname}/../../../../../bible-pinyin/cmn-hant/`;

      await bluebird.mapSeries(chapters, async chapter => {
        let chapterTraditionalExists = true;
        try {
          await stat(`${biblePathTraditional}${bibleEnglish}/${chapter}.json`);
        } catch (e) {
          chapterTraditionalExists = false;
        }

        if (onlyNotExists && chapterTraditionalExists) {
          return;
        }

        // eslint-disable-next-line
        console.log(chapter);
        const chapterContent = await readFile(
          `${biblePath}${bibleEnglish}/${chapter}.json`,
          'utf8',
        );

        const chapterObject = JSON.parse(chapterContent);
        const chapterObjectTraditional = JSON.parse(chapterContent);

        let lineIndex = 0;
        let blockIndex = 0;
        let blockInlineIndex = 0;
        let simplifiedChanged = false;

        const url = `${urlBible}${bible}/${chapter}/`;
        try {
          response = await axios.get(encoder.encodeUrl(url));
        } catch (e) {
          // eslint-disable-next-line
          console.log(e);
          // eslint-disable-next-line
          console.log(url);
          throw e;
        }
        $ = cheerio.load(response.data);

        $('#bibleText .verse').each((i, children) => {
          $(children)
            .find('.superscription')
            .remove();

          let verse = $(children)
            .find('.verseNum')
            .text()
            .trim();

          if (!verse) {
            verse = '1';
          }

          if (bibleEnglish === 'john' && chapter === '8' && i < 12) {
            return;
          }

          if (verse > bibleChapters[bibleEnglish][chapter - 1].t) {
            return;
          }

          let verseText = $(children)
            .text()
            .trim()
            .replace(/\s/g, '');

          verseText = replaceall('+', '', verseText);
          verseText = replaceall('*', '', verseText);
          verseText = replaceall(String.fromCharCode(8288), '', verseText);
          verseText = replaceall(String.fromCharCode(8203), '', verseText);

          for (let vId = 0; vId < verseText.length; vId += 1) {
            if (!verseText[vId]) {
              continue;
            }

            if (
              bibleEnglish === 'mark' &&
              chapter === '16' &&
              verse === '8' &&
              lineIndex === 1
            ) {
              return;
            }

            if (
              bibleEnglish === 'habakkuk' &&
              chapter === '3' &&
              verse === '19' &&
              lineIndex === 18
            ) {
              return;
            }

            if (!chapterObject.lines[lineIndex]) {
              throw new Error(
                'line index not found ' +
                  lineIndex +
                  ' chapter ' +
                  chapter +
                  ' verse ' +
                  verse,
              );
            }

            if (!chapterObject.lines[lineIndex][blockIndex]) {
              throw new Error(
                'line index not found ' +
                  lineIndex +
                  ' block index ' +
                  blockIndex,
              );
            }

            const blockContentSimplified =
              chapterObject.lines[lineIndex][blockIndex];

            let blockContent =
              chapterObjectTraditional.lines[lineIndex][blockIndex];

            const space = String.fromCharCode(160);

            const wordsToChange = [
              {
                c: '侄',
                nc: '侄儿',
                p: `zhí${space}r`,
              },
              {
                c: '一会',
                nc: '一会儿',
                p: `yí${space}huì${space}r`,
              },
              {
                c: '那会',
                nc: '那会儿',
                p: `nà${space}huì${space}r`,
              },
              {
                c: '会',
                nc: '会儿',
                p: `huì${space}r`,
              },
              {
                c: '过',
                nc: '过儿',
                p: `guò${space}r`,
              },
              {
                c: '雏',
                nc: '雏儿',
                p: `chú${space}r`,
              },
              {
                c: '鸟',
                nc: '鸟儿',
                p: `niǎo${space}r`,
              },
              {
                c: '过一会',
                nc: '过一会儿',
                p: `guò${space}yí${space}huì${space}r`,
              },
              {
                c: '宝贝',
                nc: '宝贝儿',
                p: `bǎo${space}bèi${space}r`,
              },
              {
                c: '眼珠',
                nc: '眼珠儿',
                p: `yǎn${space}zhū${space}r`,
              },
            ];

            for (const wordToChangeId of Object.keys(wordsToChange)) {
              const wordToChange = wordsToChange[wordToChangeId];

              if (
                blockInlineIndex === 0 &&
                blockContent.c === wordToChange.c &&
                replaceall(space, '', blockContent.p.toLowerCase()) ===
                  replaceall(space, '', wordToChange.p)
              ) {
                blockContentSimplified.c = wordToChange.nc;
                blockContentSimplified.p = wordToChange.p;

                blockContent.c = wordToChange.nc;
                blockContent.p = wordToChange.p;

                chapterObject.lines[lineIndex][
                  blockIndex
                ] = blockContentSimplified;
                simplifiedChanged = true;
              }
            }

            blockContent = blockContent.c.trim().split('');
            blockContent[blockInlineIndex] = verseText[vId];
            chapterObjectTraditional.lines[lineIndex][
              blockIndex
            ].c = blockContent.join('');

            blockInlineIndex += 1;
            if (blockInlineIndex === blockContent.length) {
              blockInlineIndex = 0;
              blockIndex += 1;
            }

            if (
              blockIndex === chapterObjectTraditional.lines[lineIndex].length
            ) {
              blockIndex = 0;
              lineIndex += 1;
            }
          }
        });

        await ensureDir(`${biblePathTraditional}${bibleEnglish}`);

        if (simplifiedChanged) {
          await writeFile(
            `${biblePath}${bibleEnglish}/${chapter}.json`,
            JSON.stringify(chapterObject),
          );
        }

        await writeFile(
          `${biblePathTraditional}${bibleEnglish}/${chapter}.json`,
          JSON.stringify(chapterObjectTraditional),
        );
      });
    });
  }
}
