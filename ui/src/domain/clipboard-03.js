// Ideograms spaced
import replaceall from 'replaceall';

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

async function parseSite(lines) {
  const rows = [];
  for (let line of lines) {
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

      rows.push(row);
      continue;
    }

    if (typeof line.text === 'string') {
      const ideograms = line.text.split(' ');

      let isBold = 0;
      let isItalic = 0;

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

        const item = {
          p: line.pinyin ? line.pinyin[i] : '',
          c: char,
        };

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
    } else {
      row = line.text;
    }

    if (line.type !== undefined) {
      row[0].line = {};
      row[0].line.type = line.type;
    }

    if (line.trans !== undefined) {
      row[0].trans = line.trans;
    }

    rows.push(row);
  }

  return rows;
}

export default async function(content) {
  content = replaceall('+', '', content);
  const lines = await parseContent(content);

  const rows = await parseSite(lines);

  return rows;
}
