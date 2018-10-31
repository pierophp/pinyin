import * as express from 'express';
import { trimStart } from 'lodash';
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
  if (req.query.type === 'file') {
    if (req.query.filename === '') {
      res.send({});
      return;
    }

    if (req.query.filename === '.json') {
      res.send({});
      return;
    }

    await fileManager.saveFile(
      req.user.id,
      `${trimStart(req.query.dirname, '/')}/${req.query.filename}`,
      req.body.content,
    );
  } else {
    await fileManager.createDir(
      req.user.id,
      `${trimStart(req.query.dirname, '/')}/${req.query.filename}`,
    );
  }

  res.send({});
});

router.delete('/', async (req: any, res) => {
  if (req.query.type === 'file') {
    await fileManager.deleteFile(req.user.id, `${req.query.filename}`);
  } else {
    await fileManager.deleteDir(req.user.id, `${req.query.filename}`);
  }
  res.send({});
});

module.exports = router;
