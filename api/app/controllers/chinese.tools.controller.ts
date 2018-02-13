import * as express from 'express';
import * as ChineseToolsDownloader from '../services/ChineseToolsDownloader';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const text = await ChineseToolsDownloader.download(req.query.ideogram, req.query.pronunciation, req.query.language);
    res.send({ status: 200, text });  
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
