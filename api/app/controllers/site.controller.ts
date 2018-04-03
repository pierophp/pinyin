import * as express from 'express';
import { Downloader } from '../core/sites/jw/downloader';
import { Frequency } from '../core/sites/jw/frequency';
import { Track } from '../core/sites/jw/track';

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

module.exports = router;
