import axios from 'axios';
import * as express from 'express';
import * as cheerio from 'cheerio';
import { setFlagsFromString } from 'v8';
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const url = `https://forvo.com/word/${encodeURI(
      req.query.word.toLowerCase(),
    )}/`;

    const response = await axios.get(url);

    const languages = {
      ch: ['zh'],
      pt: ['pt_br', 'pt', 'pt_pt'],
      en: ['en_us', 'en_usa', 'en', 'en_uk'],
    };

    if (!languages[req.query.language]) {
      languages[req.query.language] = [req.query.language];
    }

    const $ = cheerio.load(response.data);

    let header: any;
    for (const language of languages[req.query.language]) {
      header = $(`header#${language}`);

      if (header.length > 0) {
        break;
      }
    }

    if (!header) {
      throw new Error('Language not found');
    }

    const onClick = header
      .next()
      .find('span')
      .attr('onclick');

    let base64Url = onClick.split(',')[4].replace(/'/g, '');

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
