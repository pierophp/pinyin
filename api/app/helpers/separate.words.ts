// import axios from 'axios';

// export async function separateWords(text: string): Promise<string[]> {
//   const jiebaBaseUrl =
//     process.env.JIEBA_URL ?? 'https://pinyin-jieba.netlify.app';

//   const response = (
//     await axios.post(`${jiebaBaseUrl}/.netlify/functions/separateWords`, {
//       text,
//     })
//   ).data.words;

//   return response;
// }

import * as nodejieba from 'nodejieba';
import * as replaceall from 'replaceall';

let jiebaInstance;

function getJiebaInstance(): any {
  if (jiebaInstance) {
    return jiebaInstance;
  }

  let dictPath = `${__dirname.replace(
    'dist/api/',
    '',
  )}/../data/jieba.full.utf8`;

  let userDictPath = `${__dirname.replace(
    'dist/api/',
    '',
  )}/../data/compiled.utf8`;

  console.log({ dictPath, userDictPath });

  nodejieba.load({
    dict: dictPath,
    userDict: userDictPath,
  });

  jiebaInstance = nodejieba;

  return jiebaInstance;
}

export function separateWords(text: string): string[] {
  return getJiebaInstance()
    .cut(text)
    .filter((item) => {
      item = replaceall(String.fromCharCode(160), '', item); // Convert NO-BREAK SPACE to SPACE
      item = replaceall(String.fromCharCode(8201), '', item); // Convert THIN SPACE to SPACE
      item = replaceall(String.fromCharCode(8203), '', item); // Zero Width Space
      item = replaceall(String.fromCharCode(8206), '', item); // Left-To-Right Mark
      item = replaceall(String.fromCharCode(8234), '', item); // Left-To-Right Embedding

      return item.trim();
    });
}
