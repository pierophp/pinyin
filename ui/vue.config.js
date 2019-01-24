const path = require('path');

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
  },
  pwa: {
    workboxOptions: {
      exclude: [
        /static\/bible/,
        /\.map$/,
        /img\/icons\//,
        /favicon\.ico$/,
        /manifest\.json$/,
      ],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'staleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'cacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      skipWaiting: true,
    },
  },
  chainWebpack: config => {
    // A, remove the plugin
    //  config.plugins.delete('prefetch');
    // or:
    // B. Alter settings:
    // config.plugin('prefetch').tap(options => {
    //   options.fileBlackList.push([/myasyncRoute(.)+?\.js$/]);
    //   return options;
    // });
  },
};
