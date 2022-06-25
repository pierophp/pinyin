import * as express from 'express';
import axios from 'axios';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  const char = req.query.ideogram as string;
  const url = `https://chanind.github.io/hanzi-writer/cdn/2/data/${encodeURIComponent(
    char,
  )}.json`;

  try {
    const response = await axios.get(url);
    res.send({ status: 200, response: response.data });
  } catch (e) {
    res.send({ status: 500, error: e.message });
  }
});

module.exports = router;
