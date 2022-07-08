import * as express from 'express';
import { separateWords } from '../helpers/separate.words';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/segment', async (req, res) => {
  const ideogramsCuted = await separateWords(req.body.ideograms);
  res.send({ ideograms: ideogramsCuted });
});

module.exports = router;
