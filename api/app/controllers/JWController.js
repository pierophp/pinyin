const express = require('express');

const JWDownloader = require('../services/JWDownloader');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/download', async (req, res) => {
  try {
    const response = await JWDownloader
        .download(req.query.url, req.query.language, req.query.ideogramType);
    res.send({ status: 200, audio: response.audio, text: response.text });
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
    res.send({ status: 500, error: e.message, e });
  }
});

router.get('/track', (req, res) => {
  JWDownloader.track(req.query.url, req.query.type)
  .then((track) => {
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(track);
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e.message);
    res.send({ status: 500, error: e.message });
  });
});

module.exports = router;

