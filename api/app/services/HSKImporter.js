const Promise = require('bluebird');
const axios = require('axios');
const knex = require('./knex');
const UnihanSearch = require('../services/UnihanSearch');

module.exports = class HSKImporter {
  static async import() {
    const totalHsk = 6;
    for (let i = 1; i <= totalHsk; i += 1) {
      // eslint-disable-next-line
      console.log(i);
      const response = await axios.get(
        `http://www.hsk.academy/api/en/hsk/${i}`,
      );

      const words = [];
      response.data.words.forEach(word => {
        word.hanzi.split('…').forEach(item => {
          if (item) {
            words.push(item);
          }
        });

        word.trad.split('…').forEach(item => {
          if (item) {
            words.push(item);
          }
        });
      });

      await Promise.map(words, async word => {
        const items = await knex('cjk')
          .select('id', 'hsk')
          .where({
            ideogram: UnihanSearch.convertIdeogramsToUtf16(word),
          });

        if (items.length === 0) {
          // eslint-disable-next-line
          console.log('Not Found');
          // eslint-disable-next-line
          console.log(word);
          // eslint-disable-next-line
          console.log(UnihanSearch.convertIdeogramsToUtf16(word));
        }

        await Promise.map(items, async item => {
          if (item.hsk && item.hsk <= i) {
            return;
          }

          await knex('cjk')
            .where('id', '=', item.id)
            .update({
              hsk: i,
            });
        });
      });
    }
  }
};
