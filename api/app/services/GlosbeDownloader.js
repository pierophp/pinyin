const querystring = require('querystring');
const cheerio = require('cheerio');
const axios = require('axios');
const replaceall = require('replaceall');

module.exports = class ChineseToolsDownloader {
  static async download(word, language) {
    const response = await axios.get(
      `https://glosbe.com/gapi/translate?from=cmn&dest=${language}&format=json&phrase=${encodeURIComponent(
        word,
      )}`,
      {},
      { timeout: 2500 },
    );

    const result = response.data;
    if (result.result != 'ok') {
      throw new Error('Glosbe error');
    }

    return response.data.tuc.filter(item => item.phrase).map(item => {
      return item.phrase.text;
    });
  }
};
