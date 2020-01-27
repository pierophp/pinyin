import * as express from 'express';
import { IdeogramsConverter } from '../core/converter/ideograms.converter';
import { PinyinConverter } from '../core/pinyin/pinyin.converter';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/convert', async (req, res) => {
  try {
    const ideogramsConverter = new IdeogramsConverter();
    const pinyinConverter = new PinyinConverter();

    res.send({
      status: 200,
      ideogram: req.query.ideogram,
      simplified: await ideogramsConverter.traditionalToSimplified(
        req.query.ideogram,
      ),
      pinyin: (await pinyinConverter.toPinyin(req.query.ideogram))
        .map(item => item.pinyin)
        .join(' '),
    });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
