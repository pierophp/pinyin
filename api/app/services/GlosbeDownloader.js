const axios = require('axios');

module.exports = class GlosbeDownloader {
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
