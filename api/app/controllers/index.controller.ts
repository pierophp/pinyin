import * as express from 'express';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  res.send({ name: 'Simple Pinyin Editor' });
});

module.exports = router;
