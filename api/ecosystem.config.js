const isProduction = process.env.TRAVIS_BRANCH === 'master';

const postDeployCommands = [
  'cd /home/ubuntu/',
  // Pinyin Editor UI
  'rm -Rf dist/',
  `unzip pinyin.dist-${process.env.TRAVIS_BRANCH}.zip > /dev/null`,
  `sudo rm -Rf ${isProduction ? '/var/www/pinyin' : '/var/www/pinyin.staging'}`,
  `mv /home/ubuntu/dist ${
    isProduction ? '/var/www/pinyin' : '/var/www/pinyin.staging'
  }`,
  'ln -sf /var/local/pinyin/Dicionario_Pleco.txt /var/www/pinyin/Dicionario_Pleco.txt',
  // Bible Editor UI
  'rm -Rf dist/',
  `unzip bible.pinyin.dist-${process.env.TRAVIS_BRANCH}.zip > /dev/null`,
  `sudo rm -Rf ${
    isProduction ? '/var/www/bible.pinyin' : '/var/www/bible.pinyin.staging'
  }`,
  `mv /home/ubuntu/dist ${
    isProduction ? '/var/www/bible.pinyin' : '/var/www/bible.pinyin.staging'
  }`,
  // Dictionary Editor UI
  'rm -Rf dist/',
  `unzip dictionary.pinyin.dist-${process.env.TRAVIS_BRANCH}.zip > /dev/null`,
  `sudo rm -Rf ${
    isProduction
      ? '/var/www/dictionary.pinyin'
      : '/var/www/dictionary.pinyin.staging'
  }`,
  `mv /home/ubuntu/dist ${
    isProduction
      ? '/var/www/dictionary.pinyin'
      : '/var/www/dictionary.pinyin.staging'
  }`,
  // Videos Editor UI
  'rm -Rf dist/',
  `unzip videos.pinyin.dist-${process.env.TRAVIS_BRANCH}.zip > /dev/null`,
  `sudo rm -Rf ${
    isProduction ? '/var/www/videos.pinyin' : '/var/www/videos.pinyin.staging'
  }`,
  `mv /home/ubuntu/dist ${
    isProduction ? '/var/www/videos.pinyin' : '/var/www/videos.pinyin.staging'
  }`,
  // API
  `cd ${
    isProduction
      ? '/var/www/api.pinyin/current/api'
      : '/var/www/api.pinyin.staging/current/api'
  }`,
  'cp -R ../../source/api/app/data ../../source/api/dist/api/app/data',
  'cp ../../env/* .',
  'yarn install --production',
  'yarn build',
  'knex migrate:latest --env production',
  `sudo pm2 startOrRestart ecosystem-${
    isProduction ? 'master' : 'staging'
  }.json --env production`,
];

const postDeploy = postDeployCommands.join(' && ');

module.exports = {
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: process.env.SSH_USER,
      host: [
        {
          host: process.env.SSH_HOST,
          port: process.env.SSH_PORT,
        },
      ],
      ref: 'origin/master',
      repo: 'https://github.com/pierophp/pinyin.git',
      ssh_options: 'StrictHostKeyChecking=no',
      path: '/var/www/api.pinyin',
      'post-deploy': postDeploy,
    },
    staging: {
      user: process.env.SSH_USER,
      host: [
        {
          host: process.env.SSH_HOST,
          port: process.env.SSH_PORT,
        },
      ],
      ref: 'origin/staging',
      repo: 'https://github.com/pierophp/pinyin.git',
      ssh_options: 'StrictHostKeyChecking=no',
      path: '/var/www/api.pinyin.staging',
      'post-deploy': postDeploy,
    },
  },
};
