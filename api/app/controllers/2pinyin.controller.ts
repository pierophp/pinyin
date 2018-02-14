import * as express from 'express';
import * as knex from '../services/knex';
import * as UnihanSearch from '../services/UnihanSearch';

// eslint-disable-next-line new-cap
const router = express.Router();
import * as env from '../../env';

router.post('/my_words', async (req: any, res) => {
  try {
    if (req.body.token !== env['2pinyin_token']) {
      throw new Error('Invalid token');
    }

    const user = await knex('user')
      .where({
        email: req.body.email,
      })
      .select('id');
    if (!user.length) {
      throw new Error('User not found');
    }

    const userId = user[0].id;

    for (const word of req.body.words_add) {
      const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(word);

      let result = await knex('my_cjk')
        .where({
          ideogram: ideogramConverted,
          user_id: userId,
          type: 'known',
          source: '2pinyin',
        })
        .select('id');

      if (result.length === 0) {
        await knex('my_cjk').insert({
          ideogram: ideogramConverted,
          user_id: userId,
          type: 'known',
          source: '2pinyin',
          created_at: new Date(),
        });
      }
    }

    for (const word of req.body.words_delete) {
      const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(word);

      await knex('my_cjk')
        .where({
          ideogram: ideogramConverted,
          user_id: userId,
          type: 'known',
          source: '2pinyin',
        })
        .del();
    }

    res.send({ status: 200 });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
