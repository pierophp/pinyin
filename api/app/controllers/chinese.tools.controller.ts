import * as express from 'express';
import * as ChineseToolsDownloader from '../services/ChineseToolsDownloader';
import * as UnihanSearch from '../services/UnihanSearch';
import { CjkRepository } from '../repository/cjk.repository';
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


router.get('/update_all', async (req, res) => {
  try {
    const cjks = await CjkRepository.findChineseToolsNotNull(req.query.language);
    for (const cjk of cjks) {
      const response = await ChineseToolsDownloader.download(UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram), cjk.pronunciation, req.query.language);
      const saveOptions: any = {
        id: cjk.id,
      };

      saveOptions[`definition_ct_${req.query.language}`] = JSON.stringify(response);

      await CjkRepository.save(saveOptions);
    }
    res.send({ status: 200 });  
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

router.get('/insert_all', async (req, res) => {
  try {
    const cjks = await CjkRepository.findChineseToolsIsNull(req.query.language);
    for (const cjk of cjks) {
      const response = await ChineseToolsDownloader.download(UnihanSearch.convertUtf16ToIdeograms(cjk.ideogram), cjk.pronunciation, req.query.language);
      const saveOptions: any = {
        id: cjk.id,
      };

      saveOptions[`definition_ct_${req.query.language}`] = JSON.stringify(response);

      await CjkRepository.save(saveOptions);
    }
    res.send({ status: 200 });  
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
