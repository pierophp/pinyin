// JW ORG (spaced)
import http from 'src/helpers/http';
import replaceall from 'replaceall';
import Promise from 'bluebird';
import OptionsManager from 'src/domain/options-manager';
import isChinese from 'src/helpers/is-chinese';

async function parseLink(link) {
  const options = OptionsManager.getOptions();
  const response = await http.get(
    `site/download?url=${link}&language=${
      options.translationLanguage
    }&ideogramType=${options.ideogramType}`,
  );

  return response.data;
}

async function parseSite(lines, audio, url) {
  const rows = await Promise.map(lines, async line => {
    if (typeof line === 'string') {
      line = { text: line };
    }

    const row = [];
    if (
      line.type !== undefined &&
      (line.type === 'img' || line.type === 'box-img')
    ) {
      row.push({
        p: '',
        c: '',
        small: line.small,
        large: line.large,
      });
      row[0].line = {};
      row[0].line.type = line.type;
      return row;
    }

    const ideograms = line.text.split(' ');

    let isBold = 0;
    let isItalic = 0;

    let bible = '';

    ideograms.forEach((char, i) => {
      if (char === '<b>') {
        isBold = 1;
        return;
      }

      if (char === '</b>') {
        isBold = 0;
        return;
      }

      if (char === '<i>') {
        isItalic = 1;
        return;
      }

      if (char === '</i>') {
        isItalic = 0;
        return;
      }

      let footnote = null;
      const footNoteVerify = '#FOOTNOTE-';
      const isFootnote =
        char.substr(0, footNoteVerify.length) === footNoteVerify;
      if (isFootnote) {
        const footNoteSplit = char.split('-');
        footnote = footNoteSplit[1];
        char = footNoteSplit[2];
      }

      const bibleVerify = 'BI#[';
      const isBible = char.substr(0, bibleVerify.length) === bibleVerify;
      if (isBible) {
        bible = replaceall('BI#[', '', char);
        bible = replaceall(']#BI', '', bible);
        return;
      }

      const item = {
        p: line.pinyin ? line.pinyin[i] : '',
        c: char,
      };

      if (bible && !isChinese(char, true)) {
        item.b = bible;
        bible = '';
      }

      if (isBold === 1) {
        item.isBold = isBold;
      }

      if (isItalic === 1) {
        item.isItalic = isItalic;
      }

      if (footnote) {
        item.footnote = footnote;
      }

      row.push(item);
    });

    if (line.type !== undefined) {
      row[0].line = {};
      row[0].line.type = line.type;
    }

    if (line.trans !== undefined) {
      row[0].trans = line.trans;
    }

    return row;
  });

  if (audio) {
    rows[0][0].line.audio = audio;
  }

  if (rows[0][0].line) {
    rows[0][0].line.url = url;
  }

  return rows;
}

export default async function(url) {
  let lines;
  let audio = null;

  const content = await parseLink(url);
  if (content.links) {
    const files = [];
    for (const link of content.links) {
      const filename = `${link.number}|||${link.title}|||${link.title_pinyin}`;

      lines = link.content.text;
      audio = link.content.audio;

      const rows = await parseSite(lines, audio, url);

      files.push({ filename, rows });
    }

    return { files };
  }

  lines = content.text;
  audio = content.audio;

  const rows = await parseSite(lines, audio, url);

  return rows;
}
