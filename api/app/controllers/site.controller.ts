import * as express from 'express';
import { Downloader as JwDownloader } from '../core/sites/jw/downloader';
import { Downloader as GenericDownloader } from '../core/sites/generic/downloader';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/download', async (req, res) => {
  let downloader: any = new GenericDownloader();
  if (req.query.url.includes('.jw.org')) {
    downloader = new JwDownloader();
  }

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
    res.send({ status: 500, error: e ? e.message : '', e });
  }
});

module.exports = router;
