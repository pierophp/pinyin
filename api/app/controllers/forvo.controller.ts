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
      ch: ['zh'],
      pt: ['pt_br', 'pt', 'pt_pt'],
      en: ['en_us', 'en', 'en_uk'],
    };

    if (!languages[req.query.language]) {
      languages[req.query.language] = [req.query.language];
    }

    const $ = cheerio.load(response.data);

    let header: any;
    for (const language of languages[req.query.language]) {
      header = $(`header#${language}`);

      console.log(language);

      if (header) {
        break;
      }
    }

    if (!header) {
      throw new Error('Language not found');
    }

    let base64Url = header
      .next()
      .find('span')
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
