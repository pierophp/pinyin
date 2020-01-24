import axios from 'axios';
import * as express from 'express';
import * as cheerio from 'cheerio';
import { setFlagsFromString } from 'v8';
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let response = await axios.get(
      `https://forvo.com/word/${encodeURI(req.query.word.toLowerCase())}/`,
    );

    const languages = {
      ch: 'zh',
    };

    const $ = cheerio.load(response.data);

    const header = $(
      `header#${languages[req.query.language] || req.query.language}`,
    );

    let base64Url = header
      .parent()
      .find('.show-all-pronunciations li span')
      .first()
      .attr('onclick')
      .split(',')[4]
      .replace(/'/g, '');

    res.send({
      status: 200,
      word: req.query.word,
      language: req.query.language,
      url:
        'https://audio00.forvo.com/audios/mp3/' +
        Buffer.from(base64Url, 'base64').toString(),
    });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
