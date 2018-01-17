const querystring = require('querystring');
const cheerio = require('cheerio');
const axios = require('axios');
const replaceall = require('replaceall');

module.exports = class ChineseToolsDownloader {
  static async download(word, language) {
    const urls = {
      pt:
        'http://www.chinese-tools.com/tools/chinese-portuguese-dictionary.html',
      es: 'http://www.chinese-tools.com/tools/chinese-spanish-dictionary.html',
      en: 'http://www.chinese-tools.com/tools/dictionary.html',
    };

    const response = await axios.post(
      urls[language],
      querystring.stringify({ dico: word }),
      { timeout: 2500 },
    );

    const $ = cheerio.load(response.data);
    const element = $('.ctdico_entry .ctdico_def');
    if (element.length === 0) {
      return '';
    }

    let text = $(element).html();
    text = replaceall('</a>', '</a> ', text);
    text = $('<textarea />')
      .html(text)
      .text();
    return text;
  }
};
