const express = require('express');

const ChineseToolsDownloader = require('../services/ChineseToolsDownloader');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  ChineseToolsDownloader.download(req.query.word, 'pt')
    .then(text => {
      res.send({ status: 200, text });
    })
    .catch(e => {
      res.send({ status: 500, error: e.message });
    });
});

module.exports = router;
