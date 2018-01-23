import * as express from 'express';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/history', async (req, res) => {
  try {
    const response = {
      history: [],
    };
    res.send(response);
  } catch (e) {
    // eslint-disable-next-line
    console.log('videos history error', e);
    res.send({ status: 500, error: e.message, e });
  }
});

module.exports = router;
