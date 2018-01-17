import * as express from 'express';
import * as JWDownloader from '../services/JWDownloader';
import { Downloader } from '../core/sites/jw/downloader';
import { Frequency } from '../core/sites/jw/frequency';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/download', async (req, res) => {
  const downloader = new Downloader();
  try {
    const downloadResponse: any = await downloader.download(
      req.query.url,
      req.query.language,
      req.query.ideogramType,
    );

    const response: any = {
      status: 200,
      audio: downloadResponse.audio,
    };

    if (downloadResponse.text && downloadResponse.text.length > 0) {
      response.text = downloadResponse.text;
    }

    if (downloadResponse.links && downloadResponse.links.length > 0) {
      response.links = downloadResponse.links;
    }

    res.send(response);
  } catch (e) {
    // eslint-disable-next-line
    console.log('controller download error', e);
    res.send({ status: 500, error: e.message, e });
  }
});

router.get('/frequency', async (req, res) => {
  const downloader = new Downloader();
  try {
    const downloadResponse: any = await downloader.download(
      req.query.url,
      '',
      '',
      false,
    );

    const frequency = new Frequency();

    res.send(
      await frequency.getFrequency(downloadResponse, req.query.url),
    );
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
    res.send({ status: 500, error: e.message, e });
  }
});

router.get('/track', (req, res) => {
  JWDownloader.track(req.query.url, req.query.type)
    .then(track => {
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(track);
    })
    .catch(e => {
      // eslint-disable-next-line
      console.log(e.message);
      res.send({ status: 500, error: e.message });
    });
});

module.exports = router;
