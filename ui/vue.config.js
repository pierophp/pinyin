const path = require('path');
const OfflinePlugin = require('offline-plugin');

const plugins = [];
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new OfflinePlugin({
      responseStrategy: 'network-first',
      ServiceWorker: {
        events: true,
        navigateFallbackURL: 'index.html',
      },
      externals: [
        //  Material Icons
        'https://fonts.gstatic.com/s/materialicons/v31/2fcrYFNaTjcS6g4U3t-Y5UEw0lE80llgEseQY3FEmqw.woff2',
        //  Noto Sans Simplified
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Thin.woff2',
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Light.woff2',
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Regular.woff2',
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Medium.woff2',
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Bold.woff2',
        'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Black.woff2',
        //  Noto Sans Traditional
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Thin.woff2',
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Light.woff2',
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.woff2',
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Medium.woff2',
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.woff2',
        'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Black.woff2',
        // Roboto
        'https://fonts.gstatic.com/s/roboto/v18/Ks_cVxiCiwUWVsFWFA3Bjn-_kf6ByYO6CLYdB4HQE-Y.woff2', // Roboto 400 latin ext
        'https://fonts.gstatic.com/s/roboto/v18/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2', // Roboto 400 latin
        'https://fonts.gstatic.com/s/roboto/v18/97uahxiqZRoncBaCEI3aW4X0hVgzZQUfRDuZrPvH3D8.woff2', // Roboto Bold 700 latin ext
        'https://fonts.gstatic.com/s/roboto/v18/d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2', // Roboto Bold 700 latin
      ],
    }),
  );
}

module.exports = {
  devServer: {
    open: false,
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
    plugins,
  },
};
