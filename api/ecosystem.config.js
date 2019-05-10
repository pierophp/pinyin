const isProduction = process.env.TRAVIS_BRANCH === 'master';

const postDeployCommands = [
  'cd /home/ubuntu/',
  // 'ln -sf /var/local/pinyin/Dicionario_Pleco.txt /var/www/dictionary.pinyin/Dicionario_Pleco.txt',
  // API
  `cd ${
    isProduction
      ? '/var/www/api.pinyin/current/api'
      : '/var/www/api.pinyin.staging/current/api'
  }`,
  '[ -d ../../source/api/dist/ ] && cp -R ../../source/api/app/data ../../source/api/dist/api/app/data',
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
