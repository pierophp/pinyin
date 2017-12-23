const Promise = require('bluebird');
const cheerio = require('cheerio');
const axios = require('../helpers/http');
const profiler = require('../helpers/profiler');
const knex = require('./knex');
const replaceall = require('replaceall');
const replaceIdeogramsToSpace = require('../../../shared/helpers/special-ideograms-chars');
const bibleBooks = require('../../../shared/data/bible/bible');
const bibleChapters = require('../../../shared/data/bible/chapters');
const UnihanSearch = require('../services/UnihanSearch');
const fs = Promise.promisifyAll(require('fs'));
const axiosRetry = require('axios-retry');

module.exports = class JwDownloader {
  static async getInsight() {
    const dirname = `${__dirname}/../../storage/`;
    const url = 'https://wol.jw.org/cmn-Hans/wol/lv/r23/lp-chs/0/2';
    let response = await axios.get(this.encodeUrl(url));
    let $ = cheerio.load(response.data);
    const links = [];
    $('.directory li a').each((i, letterLink) => {
      links.push(`https://wol.jw.org${$(letterLink).attr('href')}`);
    });

    const words = [];

    await Promise.mapSeries(links, async letterurl => {
      response = await axios.get(this.encodeUrl(letterurl));
      $ = cheerio.load(response.data);
      $('.directory li a').each((i, wordLink) => {
        const href = $(wordLink)
          .attr('href')
          .split('/');
        const id = href[href.length - 1];
        const title = $(wordLink)
          .find('.title')
          .text()
          .trim();
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
        response = await axios.get(this.encodeUrl(wordUrl));
      } catch (e) {
        // eslint-disable-next-line
        console.log(wordUrl);
        // eslint-disable-next-line
        console.log(e.message);
        return;
      }

      $ = cheerio.load(response.data);
      words[i].translation = $('article #p1 strong')
        .text()
        .trim();
    });

    let csvBible = 'character;id;translation\n';
    words.forEach(word => {
      csvBible += `${word.title};${word.id};${word.translation}\n`;
    });

    const filenameBible = `${dirname}insight.csv`;
    await fs.writeFileAsync(filenameBible, csvBible);
  }

  static async getBiblePinyin() {
    const dirname = `${__dirname}/../../storage/`;
    const filenameBibleTotal = `${dirname}bible_total.csv`;
    const content = await fs.readFileAsync(filenameBibleTotal);
    const lines = content.toString().split('\n');
    let csvPinyin = 'word;total;type\n';
    await Promise.mapSeries(lines, async line => {
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
    await fs.writeFileAsync(filenamePinyin, csvPinyin);
  }

  static async getBibleNames() {
    const dirname = `${__dirname}/../../storage/`;
    const urlBible = 'https://www.jw.org/cmn-hans/出版物/圣经/bi12/圣经经卷';
    let response = await axios.get(this.encodeUrl(urlBible));
    let $ = cheerio.load(response.data);
    const bibles = [];
    $('.bibleBook .fullName').each((i, bibleChildren) => {
      bibles.push(
        $(bibleChildren)
          .text()
          .trim(),
      );
    });

    const words = {};
    const wordsVerses = [];

    await Promise.mapSeries(bibles, async bible => {
      const urlChapter = `https://www.jw.org/cmn-hans/出版物/圣经/bi12/圣经经卷/${bible}/`;
      response = await axios.get(this.encodeUrl(urlChapter));
      $ = cheerio.load(response.data);
      const chapters = [];
      $('.chapters .chapter').each((j, bibleChapterChildren) => {
        chapters.push(
          $(bibleChapterChildren)
            .text()
            .trim(),
        );
      });
      // eslint-disable-next-line
      console.log(bible);
      await Promise.mapSeries(chapters, async chapter => {
        // eslint-disable-next-line
        console.log(chapter);
        const url = `https://www.jw.org/cmn-hans/出版物/圣经/bi12/圣经经卷/${bible}/${chapter}/`;
        try {
          response = await axios.get(this.encodeUrl(url));
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
            verse = 1;
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
    await fs.writeFileAsync(filenameBible, csvBible);

    let csvBibleTotal = 'word;total\n';
    Object.keys(words).forEach(key => {
      csvBibleTotal += `${key};${words[key]}\n`;
    });

    const filenameBibleTotal = `${dirname}bible_total.csv`;
    await fs.writeFileAsync(filenameBibleTotal, csvBibleTotal);
  }

  static async getTraditionalBible() {
    const urlBible = 'https://www.jw.org/cmn-hant/出版物/聖經/bi12/聖經經卷/';
    let response = await axios.get(this.encodeUrl(urlBible));
    let $ = cheerio.load(response.data);
    const bibles = [];
    $('.bibleBook .fullName').each((i, bibleChildren) => {
      bibles.push(
        $(bibleChildren)
          .text()
          .trim(),
      );
    });

    await Promise.mapSeries(bibles, async bible => {
      const urlChapter = `${urlBible}${bible}/`;
      response = await axios.get(this.encodeUrl(urlChapter));
      $ = cheerio.load(response.data);
      const chapters = [];
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

      const biblePath = `${__dirname}/../../../ui/static/bible/cmn-hans/`;
      const biblePathTraditional = `${__dirname}/../../../ui/static/bible/cmn-hant/`;

      await Promise.mapSeries(chapters, async chapter => {
        let chapterTraditionalExists = true;
        try {
          await fs.statAsync(
            `${biblePathTraditional}${bibleEnglish}/${chapter}.json`,
          );
        } catch (e) {
          chapterTraditionalExists = false;
        }

        if (onlyNotExists && chapterTraditionalExists) {
          return;
        }

        // eslint-disable-next-line
        console.log(chapter);
        const chapterContent = await fs.readFileAsync(
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
          response = await axios.get(this.encodeUrl(url));
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
            verse = 1;
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

        try {
          await fs.statAsync(`${biblePathTraditional}${bibleEnglish}`);
        } catch (e) {
          await fs.mkdirAsync(`${biblePathTraditional}${bibleEnglish}`);
        }

        if (simplifiedChanged) {
          await fs.writeFileAsync(
            `${biblePath}${bibleEnglish}/${chapter}.json`,
            JSON.stringify(chapterObject),
          );
        }

        await fs.writeFileAsync(
          `${biblePathTraditional}${bibleEnglish}/${chapter}.json`,
          JSON.stringify(chapterObjectTraditional),
        );
      });
    });
  }

  static async getLanguageBible() {
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

    let response = await axios.get(this.encodeUrl(urlBible[language]));
    let $ = cheerio.load(response.data);
    const bibles = [];
    $('.bibleBook').each((i, bibleChildren) => {
      bibles.push($(bibleChildren).attr('href'));
    });

    await Promise.mapSeries(bibles, async (bible, bibleIndex) => {
      const urlChapter = `https://jw.org${bible}/`;
      response = await axios.get(this.encodeUrl(urlChapter));
      $ = cheerio.load(response.data);
      const chapters = [];
      $('.chapters .chapter').each((j, bibleChapterChildren) => {
        chapters.push(
          $(bibleChapterChildren)
            .text()
            .trim(),
        );
      });

      const bibleEnglish = Object.keys(bibleChapters)[bibleIndex];

      // eslint-disable-next-line
      console.log(bible);
      // eslint-disable-next-line
      console.log(bibleEnglish);

      const biblePath = `${__dirname}/../../../ui/static/bible/${language}/`;

      await Promise.mapSeries(chapters, async chapter => {
        // eslint-disable-next-line
        console.log(chapter);
        let chapterExists = true;
        try {
          await fs.statAsync(`${biblePath}${bibleEnglish}/${chapter}.json`);
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
          response = await axios.get(this.encodeUrl(url));
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
          $(children)
            .find('.superscription')
            .remove();

          if ($(children).find('.first').length) {
            lineIndex += 1;
            blockIndex = 0;
          } else {
            blockIndex += 1;
          }

          let verse = $(children)
            .find('.verseNum')
            .text()
            .trim();
          if (!verse) {
            verse = 1;
          }

          let verseText = $(children)
            .text()
            .trim();
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
          await fs.statAsync(`${biblePath}${bibleEnglish}`);
        } catch (e) {
          await fs.mkdirAsync(`${biblePath}${bibleEnglish}`);
        }

        await fs.writeFileAsync(
          `${biblePath}${bibleEnglish}/${chapter}.json`,
          JSON.stringify(chapterObject),
        );
      });
    });
  }

  static async loadTracks() {
    const languages = ['CH', 'CHS'];
    const videosInserted = {};
    await Promise.mapSeries(languages, async language => {
      const response = await axios.get(
        `https://data.jw-api.org/mediator/v1/categories/${language}/VideoOnDemand?detailed=1`,
      );
      const categories = response.data.category.subcategories;
      await Promise.mapSeries(categories, async category => {
        const res = await axios.get(
          `https://data.jw-api.org/mediator/v1/categories/${language}/${
            category.key
          }?detailed=1`,
        );
        const subcategories = res.data.category.subcategories;

        await Promise.mapSeries(subcategories, async subcategory => {
          if (subcategory.key.substr(-8) === 'Featured') {
            return;
          }
          const url = `https://data.jw-api.org/mediator/v1/categories/${language}/${
            subcategory.key
          }?detailed=0`;
          try {
            const subRes = await axios.get(url);

            await Promise.mapSeries(subRes.data.category.media, async media => {
              if (!media) {
                return;
              }

              await Promise.mapSeries(media.files, async file => {
                if (file.subtitles !== undefined) {
                  const urlParts = media.files[0].progressiveDownloadURL.split(
                    '/',
                  );
                  const video = urlParts[urlParts.length - 1]
                    .replace(/_r(.*)P/g, '')
                    .replace('.mp4', '');
                  if (videosInserted[video]) {
                    return;
                  }

                  const videoTrack = await knex('video_track').where({ video });
                  if (videoTrack.length === 0) {
                    await knex('video_track').insert({
                      video,
                      track_url: file.subtitles.url,
                      description: media.title,
                      created_at: new Date(),
                    });
                    // eslint-disable-next-line
                    console.log(video);
                    // eslint-disable-next-line
                    console.log(media.title);
                    // eslint-disable-next-line
                    console.log(file.subtitles.url);

                    videosInserted[video] = 1;
                  }
                }
              });
            });
          } catch (e) {
            // eslint-disable-next-line
            console.log(url);
            // eslint-disable-next-line
            console.log(e);
            return;
          }
        });
      });
    });
  }

  static async track(url, type) {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1]
      .replace(/_r(.*)P/g, '')
      .replace('.mp4', '');
    const videoTrack = await knex('video_track').where({ video: filename });

    if (videoTrack.length === 0) {
      return '';
    }

    let showPinyin = true;
    let showIdeograms = true;
    if (type === 'p') {
      showIdeograms = false;
    }

    if (type === 'c') {
      showPinyin = false;
    }

    const response = await axios.get(this.encodeUrl(videoTrack[0].track_url));

    const lines = response.data.split('\n');
    let i = 0;
    const trackList = await Promise.map(lines, async line => {
      const lineSplit = line.split('-->');
      if (lineSplit.length > 1) {
        i += 1;
        return line;
      }

      if (i > 0) {
        if (line.trim()) {
          const ideograms = UnihanSearch.segment(line);
          const pinyinList = await UnihanSearch.toPinyin(ideograms);
          let newLine = '<ruby>';
          pinyinList.forEach(pinyin => {
            if (showIdeograms) {
              newLine += `${pinyin.ideogram}`;
            }
            if (showPinyin) {
              newLine += ` <rt>${pinyin.pinyin.trim()}</rt> `;
            } else {
              newLine += ' <rt> </rt> ';
            }
          });
          newLine += '</ruby>';

          return newLine;
        }

        return line;
      }

      return line;
    });

    return trackList.join('\n');
  }

  static encodeUrl(url) {
    let newUrl = 'https://www.jw.org/';
    if (url.substr(0, newUrl.length) !== newUrl) {
      return url;
    }

    const urlParts = url.replace(newUrl, '').split('/');
    urlParts.forEach(urlPart => {
      newUrl += encodeURIComponent(urlPart);
      newUrl += '/';
    });
    return newUrl;
  }
};
