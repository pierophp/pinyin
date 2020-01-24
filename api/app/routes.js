/* eslint-disable global-require */

module.exports = function routes(app) {
  app.use('/', require('./controllers/index.controller'));
  app.use('/auth', require('./controllers/auth.controller'));
  app.use('/files', require('./controllers/files.controller'));
  app.use('/segmentation', require('./controllers/segmentation.controller'));
  app.use('/jw', require('./controllers/jw.controller'));
  app.use('/site', require('./controllers/site.controller'));
  app.use('/unihan', require('./controllers/unihan.controller'));
  app.use('/my-cjk', require('./controllers/my.cjk.controller'));
  app.use('/chinese-tools', require('./controllers/chinese.tools.controller'));
  app.use('/hanzi-writer', require('./controllers/hanzi.writer.controller'));
  app.use('/dictionary', require('./controllers/dictionary.controller'));
  app.use('/videos', require('./controllers/videos.controller'));
  app.use('/2pinyin', require('./controllers/2pinyin.controller'));
  app.use('/forvo', require('./controllers/forvo.controller'));
};
