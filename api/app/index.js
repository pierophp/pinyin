const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');

const app = express();
app.use(cors());

app.use(
  jwt({
    secret: process.env['JWT_KEY'],
    algorithms: ['HS256'],
    requestProperty: 'user',
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
      '/proxy',
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
