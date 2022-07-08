import { Handler } from '@netlify/functions';
import { separateChineseWords } from 'separate-chinese-words';
import { exec } from 'node:child_process';

const handler: Handler = async (event, context) => {
  const dictPath = process.env.NETLIFY_DEV
    ? `${process.env.PWD}/node_modules/separate-chinese-words/dict/`
    : `${process.env.PWD}/services/jieba/node_modules`;

  // `ls -la /var/task/services/jieba/netlify/functions/separateWords.js`,
  // `cat /var/task/services/jieba/netlify/functions/separateWords.js`,
  const cmds = [
    `ls -la /var/task`,
    `ls -la /var/task/services/jieba/netlify/`,
    `ls -la /var/task/services/jieba/netlify/functions`,
  ];

  let response = '';

  for (const cmd of cmds) {
    response += `\n\n${cmd}\n`;
    response += await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout);
      });
    });
  }

  return {
    statusCode: 200,
    body: response,
  };

  // const body = event.body ? JSON.parse(event.body) : null;

  // if (!body?.text) {
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify({ message: 'Text is required' }),
  //   };
  // }

  // const response = separateChineseWords(body.text, {
  //   dictPath: nodeModulesPath + '/separate-chinese-words/dict/jieba.dict.utf8',
  //   userDictPath:
  //     nodeModulesPath + '/separate-chinese-words/dict/user.dict.utf8',
  // }).filter((item) => {
  //   return item
  //     .replaceAll(String.fromCharCode(160), '') // Convert NO-BREAK SPACE to Space
  //     .replaceAll(String.fromCharCode(8201), '') // Convert THIN SPACE to Space
  //     .replaceAll(String.fromCharCode(8203), '') // Zero Width Space
  //     .replaceAll(String.fromCharCode(8206), '') // Left-To-Right Mark
  //     .replaceAll(String.fromCharCode(8234), '') // Left-To-Right Embedding
  //     .trim();
  // });

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     words: response,
  //   }),
  //   headers: {
  //     'content-type': 'application/json',
  //   },
  // };
};

export { handler };
