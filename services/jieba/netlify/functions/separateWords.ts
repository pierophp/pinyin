import { Handler } from '@netlify/functions';
import { separateChineseWords } from 'separate-chinese-words';

const handler: Handler = async (event, context) => {
  const dictPath = process.env.NETLIFY_DEV
    ? `${process.env.PWD}/node_modules/separate-chinese-words/dict`
    : `${process.env.PWD}/services/jieba/dict`;

  const body = event.body ? JSON.parse(event.body) : null;

  if (!body?.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Text is required' }),
    };
  }

  const response = separateChineseWords(body.text, {
    dictPath: dictPath + '/jieba.dict.utf8',
    userDictPath: dictPath + '/user.dict.utf8',
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
