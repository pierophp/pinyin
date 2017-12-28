// JW ORG (spaced)
import http from 'src/helpers/http';
import replaceall from 'replaceall';
import Promise from 'bluebird';
import OptionsManager from 'src/domain/options-manager';
import isChinese from 'src/helpers/is-chinese';

async function parseJW(link) {
  const options = OptionsManager.getOptions();
  const response = await http.get(
    `jw/download?url=${link}&language=${
      options.translationLanguage
    }&ideogramType=${options.ideogramType}`,
  );

  return response.data;
}

function parseContent(content) {
  return new Promise(resolve => {
    const lines = content
      .split('\n')
      .filter(line => line)
      .filter(line => {
        if (line.match(/(\d{2}):(\d{4}):(\d{2})/)) {
          return null;
        }

        return line;
      });

    resolve(lines);
  });
}

export default async function (content) {
  const siteJwOrg = 'https://www.jw.org';
  const isJwOrg = content.trim().substr(0, siteJwOrg.length) === siteJwOrg;

  let lines;
  let audio = null;
  if (isJwOrg) {
    const jwContent = await parseJW(content);
    lines = jwContent.text;
    audio = jwContent.audio;
  } else {
    content = replaceall('+', '', content);
    lines = await parseContent(content);
  }

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
        p: line.pinyin[i],
        c: char,
      };

      if (bible && !isChinese(char, true)) {
        item.b = bible;
        bible = '';
      }

      if (isBold === 1) {
        item.isBold = isBold;
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

  if (isJwOrg) {
    rows[0][0].line.url = content;
  }

  return rows;
}
