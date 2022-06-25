import * as express from 'express';
import { Downloader } from '../core/sites/jw/downloader';
import { Frequency } from '../core/sites/jw/frequency';
import { Track } from '../core/sites/jw/track';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/frequency', async (req, res) => {
  const downloader = new Downloader();
  try {
    const downloadResponse: any = await downloader.download(
      req.query.url as string,
      '',
      '',
      false,
    );

    const frequency = new Frequency();

    res.send(await frequency.getFrequency(downloadResponse, req.query.url));
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
    res.send({ status: 500, error: e.message, e });
  }
});

router.get('/track', async (req: any, res) => {
  try {
    const track = new Track();
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(await track.get(req.query.url, req.query.type, req.user.id));
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
