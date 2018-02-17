import * as express from 'express';

import { ChineseToolsParser } from '../core/parser/chinese.tools.parser';
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req: any, res: any) => {
  try {
    const chineseToolsParser = new ChineseToolsParser();
    const text = await chineseToolsParser.parse(
      req.query.ideogram,
      req.query.pronunciation,
      req.query.language,
    );
    res.send({ status: 200, text });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
