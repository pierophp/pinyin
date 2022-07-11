const Promise = require('bluebird');
const cheerio = require('cheerio');
const replaceall = require('replaceall');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const { Encoder } = require('../core/sites/encoder');
const bibleChapters = require('../data/bible/chapters');
const UnihanSearch = require('../services/UnihanSearch');
const fs = require('fs-extra');

module.exports = class JwDownloader {
  static async getInsight() {
    const encoder = new Encoder();
    const dirname = `${__dirname}/../../../storage/`;
    const url = 'https://wol.jw.org/cmn-Hans/wol/lv/r23/lp-chs/0/2';
    let response = await axios.get(encoder.encodeUrl(url));
    let $ = cheerio.load(response.data);
    const links = [];
    $('.directory li a').each((i, letterLink) => {
      links.push(`https://wol.jw.org${$(letterLink).attr('href')}`);
    });

    const words = [];

    await Promise.mapSeries(links, async (letterurl) => {
      response = await axios.get(encoder.encodeUrl(letterurl));
      $ = cheerio.load(response.data);
      $('.directory li a').each((i, wordLink) => {
        const href = $(wordLink).attr('href').split('/');
        const id = href[href.length - 1];
        const title = $(wordLink).find('.title').text().trim();
        words.push({
          id,
          title,
        });
      });
    });

    await Promise.mapSeries(words, async (word, i) => {
      // pt
      // const wordUrl = `https://wol.jw.org/pt/wol/d/r5/lp-t/${word.id}`;
      // cmn-hant
      const wordUrl = `https://wol.jw.org/cmn-Hant/wol/d/r24/lp-ch/${word.id}`;
      try {
        response = await axios.get(encoder.encodeUrl(wordUrl));
      } catch (e) {
        // eslint-disable-next-line
        console.log(wordUrl);
        // eslint-disable-next-line
        console.log(e.message);
        return;
      }

      $ = cheerio.load(response.data);
      words[i].translation = $('article #p1 strong').text().trim();
    });

    let csvBible = 'character;id;translation\n';
    words.forEach((word) => {
      csvBible += `${word.title};${word.id};${word.translation}\n`;
    });

    const filenameBible = `${dirname}insight.csv`;
    await fs.writeFile(filenameBible, csvBible);
  }

  static async getBiblePinyin() {
    const dirname = `${__dirname}/../../../storage/`;
    const filenameBibleTotal = `${dirname}bible_total.csv`;
    const content = await fs.readFile(filenameBibleTotal);
    const lines = content.toString().split('\n');
    let csvPinyin = 'word;total;type\n';
    await Promise.mapSeries(lines, async (line) => {
      const values = line.split(';');
      let pinyin = await UnihanSearch.searchByWord(values[0]);
      let type = 'database';
      if (!pinyin) {
        pinyin = UnihanSearch.parseResultByIdeograms(
          await UnihanSearch.searchByIdeograms(values[0]),
          values[0],
          null,
          {},
        ).pinyin;
        type = 'generated';
      }
      if (pinyin) {
        csvPinyin += `${values[0]};${pinyin};${type}\n`;
      }
    });

    const filenamePinyin = `${dirname}pinyin_bible.csv`;
    await fs.writeFile(filenamePinyin, csvPinyin);
  }

  static async getLanguageBible() {
    const encoder = new Encoder();
    const language = 'de';
    const urlBible = {
      pt: 'https://www.jw.org/pt/publicacoes/biblia/nwt/livros/',
      en: 'https://www.jw.org/en/publications/bible/nwt/books/',
      es: 'https://www.jw.org/es/publicaciones/biblia/bi12/libros/',
      ko: 'https://www.jw.org/ko/publications/성경/nwt/목차/',
      ja: 'https://www.jw.org/ja/出版物/聖書/bi12/各書/',
      it: 'https://www.jw.org/it/pubblicazioni/bibbia/bi12/libri/',
      fr: 'https://www.jw.org/fr/publications/bible/bi12/livres/',
      de: 'https://www.jw.org/de/publikationen/bibel/bi12/bibelbuecher/',
    };

    axiosRetry(axios, { retries: 5 });

    let response = await axios.get(encoder.encodeUrl(urlBible[language]));
    let $ = cheerio.load(response.data);
    const bibles = [];
    $('.bibleBook').each((i, bibleChildren) => {
      bibles.push($(bibleChildren).attr('href'));
    });

    await Promise.mapSeries(bibles, async (bible, bibleIndex) => {
      const urlChapter = `https://jw.org${bible}/`;
      response = await axios.get(encoder.encodeUrl(urlChapter));
      $ = cheerio.load(response.data);
      const chapters = [];
      $('.chapters .chapter').each((j, bibleChapterChildren) => {
        chapters.push($(bibleChapterChildren).text().trim());
      });

      const bibleEnglish = Object.keys(bibleChapters)[bibleIndex];

      // eslint-disable-next-line
      console.log(bible);
      // eslint-disable-next-line
      console.log(bibleEnglish);

      const biblePath = `${__dirname}/../../../ui/static/bible/${language}/`;

      await Promise.mapSeries(chapters, async (chapter) => {
        // eslint-disable-next-line
        console.log(chapter);
        let chapterExists = true;
        try {
          await fs.stat(`${biblePath}${bibleEnglish}/${chapter}.json`);
        } catch (e) {
          chapterExists = false;
        }

        if (chapterExists) {
          return;
        }

        let lineIndex = 0;
        let blockIndex = -1;

        const url = `${urlChapter}/${chapter}/`;
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
        const chapterObject = {};
        chapterObject.lines = [];
        chapterObject.lines[0] = [];
        chapterObject.lines[0][0] = {};
        chapterObject.lines[0][0].line = {};
        chapterObject.lines[0][0].line.pinyinSpaced = 1;

        $('#bibleText .verse').each((i, children) => {
          $(children).find('.superscription').remove();

          if ($(children).find('.first').length) {
            lineIndex += 1;
            blockIndex = 0;
          } else {
            blockIndex += 1;
          }

          let verse = $(children).find('.verseNum').text().trim();
          if (!verse) {
            verse = 1;
          }

          let verseText = $(children).text().trim();
          verseText = replaceall('+', '', verseText);
          verseText = replaceall('*', '', verseText);

          if (!chapterObject.lines[lineIndex]) {
            chapterObject.lines[lineIndex] = [];
          }

          if (!chapterObject.lines[lineIndex][blockIndex]) {
            chapterObject.lines[lineIndex][blockIndex] = {};
          }
          let splitChar = '  ';
          if (i === 0) {
            splitChar = ' ';
          }

          const verseTextArray = verseText.split(splitChar);

          chapterObject.lines[lineIndex][blockIndex].p = verseTextArray[0];
          chapterObject.lines[lineIndex][blockIndex].v = parseInt(verse, 10);
          blockIndex += 1;
          chapterObject.lines[lineIndex][blockIndex] = {};
          chapterObject.lines[lineIndex][blockIndex].p = verseTextArray
            .splice(1)
            .join(splitChar)
            .trim();
        });

        try {
          await fs.stat(`${biblePath}${bibleEnglish}`);
        } catch (e) {
          await fs.mkdir(`${biblePath}${bibleEnglish}`);
        }

        await fs.writeFile(
          `${biblePath}${bibleEnglish}/${chapter}.json`,
          JSON.stringify(chapterObject),
        );
      });
    });
  }
};
