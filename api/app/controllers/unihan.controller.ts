import * as bluebird from 'bluebird';
import { remove as removeDiacritics } from 'diacritics';
import * as express from 'express';
import { ArrayCache } from '../cache/array.cache';
import { RedisCache } from '../cache/redis.cache';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import { DictionaryManager } from '../core/dictionary/dictionary.manager';
import { PinyinConverter } from '../core/pinyin/pinyin.converter';
import { CjkRepository } from '../repository/cjk.repository';
import * as knex from '../services/knex';
// @ts-ignore
import * as UnihanSearch from '../services/UnihanSearch';

const ideogramsConverter = new IdeogramsConverter();
const pinyinConverter = new PinyinConverter();
// eslint-disable-next-line new-cap
const router = express.Router();
router.get('/search', async (req, res) => {
  const pinyin = (req.query.pinyin as string).toLowerCase();

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

  bluebird.join(mostUsedPromise, lessUsedPromise, (mostUsed, lessUsed) => {
    const result: any = {};
    result.items = mostUsed;
    result.lessUsed = lessUsed;
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.post('/to_pinyin', async (req, res) => {
  const ideograms = req.body.ideograms;
  try {
    const result = await pinyinConverter.toPinyin(ideograms);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  } catch (e) {
    console.log(e);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({}));
  }
});

router.post('/to_pinyin_all', (req, res) => {
  const ideograms = req.body.ideograms;
  pinyinConverter.toPinyin(ideograms, { pinyinAll: true }).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  });
});

router.get('/dictionary_search', async (req, res) => {
  const dictionaryManager = new DictionaryManager();
  const result = await dictionaryManager.search(
    req.query.search as string,
    req.query.debug ? true : false,
  );

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
});

router.get('/dictionary', async (req, res) => {
  const search: any = {};
  if (req.query.ideograms !== undefined) {
    search.ideograms = req.query.ideograms;
  }

  if (req.query.pinyin !== undefined) {
    search.pinyin = req.query.pinyin;
  }

  if (req.query.id !== undefined) {
    search.id = req.query.id;
  }

  res.setHeader('Content-Type', 'application/json');

  let result: any = await UnihanSearch.searchToDictionary(search);

  if (result.pronunciation) {
    res.send(JSON.stringify(result));
    return;
  }

  if (!search.ideograms) {
    res.send(JSON.stringify(result));
    return;
  }

  result = await UnihanSearch.searchToDictionaryPartial(search.ideograms);
  res.send(JSON.stringify({ list: result }));
});

router.post('/save', async (req: any, res) => {
  if (!req.user.admin) {
    res.status(403);
    return;
  }

  const ideogram = ideogramsConverter.convertIdeogramsToUtf16(
    await ideogramsConverter.traditionalToSimplified(req.body.ideograms),
  );

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
    await CjkRepository.save({
      id,
      definition_pt: JSON.stringify(req.body.dictionary),
    });
  } else {
    const pronunciationUnaccented = removeDiacritics(pronunciation);
    await CjkRepository.save({
      ideogram,
      ideogram_raw: req.body.ideograms,
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
