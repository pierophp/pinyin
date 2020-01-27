if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('newrelic');
}

const express = require('express');
const env = require('../env');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const jwt = require('express-jwt');

const app = express();
if (process.env.NODE_ENV === 'production') {
  // RAVEN - SENTRY
  // eslint-disable-next-line global-require
  const Raven = require('raven');
  Raven.config(env.sentry_dsn).install();
  app.use(Raven.requestHandler());
  app.use(Raven.errorHandler());
}

app.use(cors());

app.use(
  jwt({
    secret: env.jwt_key,
  }).unless({
    path: [
      '/',
      '/auth/google',
      '/auth/google/callback',
      '/auth/baidu',
      '/auth/baidu/callback',
      '/unihan/to_pinyin',
      '/unihan/dictionary',
      '/unihan/dictionary_search',
      '/segmentation/segment',
      '/dictionary/moedict',
      '/site/download',
      '/jw/frequency',
      '/chinese-tools',
      '/hanzi-writer',
      '/2pinyin/my_words',
      '/2pinyin/dictionary',
      '/forvo',
      '/cards/convert',
    ],
  }),
);
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  return next();
});

app.use(express.static('public'));
app.use(passport.initialize());
app.use(bodyParser.json({ limit: '10mb' }));

require('./routes')(app, passport);
require('./config/passport')(passport);

module.exports = app;
