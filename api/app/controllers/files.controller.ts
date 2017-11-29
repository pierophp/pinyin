import * as bluebird from 'bluebird';
import * as fsSync from 'fs';
import * as express from 'express';
import { FileManager } from '../core/files/file.manager'

const fileManager = new FileManager();

const fs = bluebird.promisifyAll(fsSync);
const env = require('../../env');

// eslint-disable-next-line new-cap
const router = express.Router();
let dirname = `${__dirname}/../../storage/files/`;
if (env.storage_path) {
  dirname = `${env.storage_path}files/`;
}

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

router.delete('/', (req: any, res) => {
  const filename = req.query.filename;
  const filesPath = `${dirname + req.user.id}/`;
  fs.unlinkAsync(filesPath + filename).then(() => {
    res.send({});
  });
});

module.exports = router;
