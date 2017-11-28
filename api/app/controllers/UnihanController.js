const express = require('express');
const UnihanSearch = require('../services/UnihanSearch');
const knex = require('../services/knex');
const Promise = require('bluebird');
const ArrayCache = require('../cache/ArrayCache');
const RedisCache = require('../cache/RedisCache');
const removeDiacritics = require('diacritics').remove;
const opencc = require('node-opencc');

// eslint-disable-next-line new-cap
const router = express.Router();
router.get('/search', async (req, res) => {
  const pinyin = req.query.pinyin.toLowerCase();

  const mostUsedPromise = knex('cjk')
    .where({
      pronunciation: pinyin,
    })
    .where('frequency', '<=', 5)
    .orderBy('frequency', 'ASC')
    .orderBy('usage', 'DESC')
    .select('id', 'pronunciation', 'ideogram', 'frequency', 'usage');

  const lessUsedPromise = knex('cjk')
    .where({
      pronunciation: pinyin,
    })
    .where('frequency', '>', 5)
    .orderBy('frequency', 'ASC')
    .orderBy('usage', 'DESC')
    .select('id', 'pronunciation', 'ideogram', 'frequency', 'usage');

  Promise.join(mostUsedPromise, lessUsedPromise,
    (mostUsed, lessUsed) => {
      const result = {};
      result.items = mostUsed;
      result.lessUsed = lessUsed;
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    });
});

router.post('/to_pinyin', (req, res) => {
  const ideograms = req.body.ideograms;
  UnihanSearch.toPinyin(ideograms).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.post('/to_pinyin_all', (req, res) => {
  const ideograms = req.body.ideograms;
  UnihanSearch.toPinyin(ideograms, { pinyinAll: true }).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.get('/dictionary_search', (req, res) => {
  const ideograms = req.query.search;
  UnihanSearch.searchToDictionaryList(ideograms).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.get('/dictionary', (req, res) => {
  const search = {};
  if (req.query.ideograms !== undefined) {
    search.ideograms = req.query.ideograms;
  }

  if (req.query.pinyin !== undefined) {
    search.pinyin = req.query.pinyin;
  }

  if (req.query.id !== undefined) {
    search.id = req.query.id;
  }

  UnihanSearch.searchToDictionary(search).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.post('/save', async (req, res) => {
  if (!req.user.admin) {
    res.status(403);
    return;
  }

  const ideogram = UnihanSearch
        .convertIdeogramsToUtf16(await opencc.traditionalToSimplified(req.body.ideograms));
  const pronunciation = req.body.pinyin.toLowerCase();

  let response = await knex('cjk')
        .where({
          ideogram,
          pronunciation,
        })
        .select('id');

  if (!response.length) {
    response = await knex('cjk')
          .where({
            ideogram,
            main: 1,
          })
          .select('id');
  }

  if (response.length) {
    const id = response[0].id;
    await knex('cjk')
        .where('id', '=', id)
        .update({
          definition_pt: JSON.stringify(req.body.dictionary),
        });
  } else {
    const pronunciationUnaccented = removeDiacritics(pronunciation);
    await knex('cjk')
        .insert({
          ideogram,
          main: 1,
          pronunciation,
          pronunciation_unaccented: pronunciationUnaccented,
          language_id: 1,
          simplified: 1,
          hsk: 999,
          type: 'W',
          usage: 0,
          created_at: new Date(),
          definition_pt: JSON.stringify(req.body.dictionary),
        });

    const cacheKey = `PINYIN_${ideogram}`;

    await ArrayCache.forget(cacheKey);
    await RedisCache.forget(cacheKey);
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({}));
});


module.exports = router;
