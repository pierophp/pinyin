const express = require('express');
const axios = require('axios');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  const char = req.query.ideogram;
  axios
    .get(
      `http://chanind.github.io/hanzi-writer/cdn/2/data/${encodeURIComponent(
        char,
      )}.json`,
    )
    .then(response => {
      res.send({ status: 200, response: response.data });
    })
    .catch(e => {
      res.send({ status: 500, error: e.message });
    });
});

module.exports = router;
