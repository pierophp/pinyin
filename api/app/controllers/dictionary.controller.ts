import * as express from 'express';
import * as knex from '../services/knex';
import * as TradOrSimp from 'traditional-or-simplified';
// eslint-disable-next-line new-cap
const router = express.Router();
router.get('/moedict', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const fields = [
      'pronunciation_case',
      'ideogram',
      'ideogram_simplified',
      'definition',
    ];

    let searchField = 'ideogram';

    if (!TradOrSimp.isTraditional(req.query.ideogram)) {
      searchField = 'ideogram_simplified';
    }

    let moedict = await knex('moedict')
      .where({
        [searchField]: req.query.ideogram,
        pronunciation_case: req.query.pronunciation
          ? (req.query.pronunciation as string).toLowerCase()
          : '',
      })
      .select(...fields);

    if (moedict.length === 0) {
      moedict = await knex('moedict')
        .where({
          [searchField]: req.query.ideogram,
        })
        .select(...fields);
    }

    if (moedict.length > 0) {
      res.send({
        pronunciation: moedict[0].pronunciation_case,
        definition: moedict[0].definition,
      });
    } else {
      res.send({});
    }
  } catch (e) {
    res.status(500).send({
      message: e.message,
    });
  }
});

module.exports = router;
