import * as express from 'express';
import * as env from '../../env';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import * as knex from '../services/knex';

// eslint-disable-next-line new-cap
const router = express.Router();

const ideogramConverter = new IdeogramsConverter();

router.post('/my_words', async (req: any, res) => {
  try {
    const token = process.env['2PINYIN_TOKEN'] ?? env['2pinyin_token'];
    if (req.body.token !== token) {
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
      const ideogramConverted = ideogramConverter.convertIdeogramsToUtf16(word);

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
      const ideogramConverted = ideogramConverter.convertIdeogramsToUtf16(word);

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
