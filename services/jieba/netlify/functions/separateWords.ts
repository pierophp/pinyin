import { Handler } from '@netlify/functions';
import { separateChineseWords } from 'separate-chinese-words';
import { exec } from 'node:child_process';

const handler: Handler = async (event, context) => {
  // const response = await new Promise((resolve, reject) => {
  //   exec('ldd --version', (error, stdout, stderr) => {
  //     if (error) {
  //       return reject(error);
  //     }

  //     resolve(stdout);
  //   });
  // });

  // return {
  //   statusCode: 200,
  //   body: response,
  // };

  const body = event.body ? JSON.parse(event.body) : null;

  if (!body?.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Text is required' }),
    };
  }

  const response = separateChineseWords(body.text, {
    dictPath: 'node_modules/separate-chinese-words/dict/jieba.dict.utf8',
    userDictPath: 'node_modules/separate-chinese-words/dict/user.dict.utf8',
  }).filter((item) => {
    return item
      .replaceAll(String.fromCharCode(160), '') // Convert NO-BREAK SPACE to Space
      .replaceAll(String.fromCharCode(8201), '') // Convert THIN SPACE to Space
      .replaceAll(String.fromCharCode(8203), '') // Zero Width Space
      .replaceAll(String.fromCharCode(8206), '') // Left-To-Right Mark
      .replaceAll(String.fromCharCode(8234), '') // Left-To-Right Embedding
      .trim();
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      words: response,
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
};

export { handler };
