import * as express from 'express';
import { VideoHistoryRepository } from '../repository/video.history.repository';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/history', async (req: any, res) => {
  try {
    const response = {
      history: await VideoHistoryRepository.findByUserId(
        parseInt(req.user.id, 10),
      ),
    };
    res.send(response);
  } catch (e) {
    // eslint-disable-next-line
    console.log('videos history error', e);
    res.send({ status: 500, error: e.message, e });
  }
});

module.exports = router;
