/* eslint-disable global-require */

module.exports = function routes(app) {
  app.use('/', require('./controllers/index.controller'));
  app.use('/auth', require('./controllers/AuthController'));
  app.use('/files', require('./controllers/files.controller'));
  app.use('/segmentation', require('./controllers/SegmentationController'));
  app.use('/jw', require('./controllers/jw.controller'));
  app.use('/unihan', require('./controllers/unihan.controller'));
  app.use('/my-cjk', require('./controllers/MyCjkController'));
  app.use('/chinese-tools', require('./controllers/chinese.tools.controller'));
  app.use('/hanzi-writer', require('./controllers/hanzi.writer.controller'));
  app.use('/videos', require('./controllers/videos.controller'));
};
