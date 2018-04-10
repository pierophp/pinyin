const path = require('path');

module.exports = {
  devServer: {
    port: 8090,
  },
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      alias: {
        src: path.resolve('./src'),
        shared: path.resolve('src/../../shared'),
        assets: path.resolve('src/assets'),
        components: path.resolve('src/components'),
      },
    },
    entry: {
      app: `./src/${process.env.BUILD_ENTRYPOINT}.js`,
    },
  },
};
