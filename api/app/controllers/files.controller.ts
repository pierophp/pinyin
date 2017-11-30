import * as bluebird from 'bluebird';
import * as express from 'express';

import { FileManager } from '../core/files/file.manager';

const fileManager = new FileManager();

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req: any, res) => {
  res.send(await fileManager.getFiles(req.user.id));
});

router.get('/file', async (req: any, res) => {
  res.send(await fileManager.getFile(req.user.id, req.query.filename));
});

router.post('/save', async (req: any, res) => {
  await fileManager.saveFile(req.user.id, req.query.filename, req.body.content);
  res.send({});
});

router.delete('/', async (req: any, res) => {
  await fileManager.deleteFile(req.user.id, req.query.filename);
  res.send({});
});

module.exports = router;
