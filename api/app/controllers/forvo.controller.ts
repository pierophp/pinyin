import axios from 'axios';
import * as express from 'express';
import * as cheerio from 'cheerio';
import * as replaceall from 'replaceall';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const url = `https://forvo.com/word/${encodeURI(
      replaceall(' ', '_', (req.query.word as string).toLowerCase()),
    )}/`;

    const response = await axios.get(url);

    const languages = {
      ch: ['zh'],
      pt: ['pt_br', 'pt', 'pt_pt'],
      en: ['en_us', 'en_usa', 'en_uk', 'en'],
    };

    if (!languages[req.query.language as string]) {
      languages[req.query.language as string] = [req.query.language];
    }

    const $ = cheerio.load(response.data);

    let header: any;
    for (const language of languages[req.query.language as string]) {
      header = $(`header#${language}`);

      if (header.length > 0) {
        break;
      }
    }

    if (!header) {
      throw new Error('Language not found');
    }

    let parentElement = header.next('li');

    if (!parentElement || parentElement.length === 0) {
      parentElement = header.parent().find('li');
    }

    let onClick = parentElement.find('span.play').attr('onclick');

    let splitOnClick = onClick.split(',');

    let base64Url = splitOnClick[4].replace(/'/g, '');

    let baseUrl = 'https://audio00.forvo.com/audios/mp3/';

    if (!base64Url) {
      parentElement = parentElement.next();

      onClick = parentElement.find('span.play').attr('onclick');

      if (onClick) {
        splitOnClick = onClick.split(',');
        base64Url = splitOnClick[4].replace(/'/g, '');
      } else {
        base64Url = splitOnClick[1].replace(/'/g, '');
        baseUrl = 'https://audio00.forvo.com/mp3/';
      }
    }

    const audioFile = Buffer.from(base64Url, 'base64').toString();

    res.send({
      status: 200,
      word: req.query.word,
      language: req.query.language,
      url: audioFile ? baseUrl + audioFile : '',
    });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
