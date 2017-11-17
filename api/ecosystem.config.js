const isProduction = process.env.TRAVIS_BRANCH === 'master';
console.log('isProduction');
console.log(isProduction);
const postDeployCommands = [
  'cd /home/ubuntu/',
  // Pinyin Editor UI
  'rm -Rf dist/',
  'unzip pinyin.dist.zip > /dev/null',
  `sudo rm -Rf ${isProduction ? '/var/www/pinyin' : '/var/www/pinyin.dev'}`,
  `mv /home/ubuntu/dist ${isProduction ? '/var/www/pinyin' : '/var/www/pinyin.dev'}`,
  'ln -s /var/local/pinyin/Dicionario_Pleco.txt /var/www/pinyin/Dicionario_Pleco.txt',
  // Bible Editor UI
  'rm -Rf dist/',
  'unzip bible.pinyin.dist.zip > /dev/null',
  `sudo rm -Rf ${isProduction ? '/var/www/bible.pinyin' : '/var/www/bible.pinyin.dev'}`,
  `mv /home/ubuntu/dist ${isProduction ? '/var/www/bible.pinyin' : '/var/www/bible.pinyin.dev'}`,
  // Dictionary Editor UI
  'rm -Rf dist/',
  'unzip dictionary.pinyin.dist.zip > /dev/null',
  `sudo rm -Rf ${isProduction ? '/var/www/dictionary.pinyin' : '/var/www/dictionary.pinyin.dev'}`,
  `mv /home/ubuntu/dist ${isProduction ? '/var/www/dictionary.pinyin' : '/var/www/dictionary.pinyin.dev'}`,
  // Videos Editor UI
  'rm -Rf dist/',
  'unzip videos.pinyin.dist.zip > /dev/null',
  `sudo rm -Rf ${isProduction ? '/var/www/videos.pinyin' : '/var/www/videos.pinyin.dev'}`,
  `mv /home/ubuntu/dist ${isProduction ? '/var/www/videos.pinyin' : '/var/www/videos.pinyin.dev'}`,
  // API
  `cd ${isProduction ? '/var/www/api.pinyin/current/api' : '/var/www/api.pinyin.dev/current/api'}`,
  'cp ../../env/* .',
  'yarn install --production',
  'knex migrate:latest --env production',
  'sudo pm2 startOrRestart ecosystem.json --env production',
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
      host: [{
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
      host: [{
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
      },
      ],
      ref: 'origin/dev',
      repo: 'https://github.com/pierophp/pinyin.git',
      ssh_options: 'StrictHostKeyChecking=no',
      path: '/var/www/api.pinyin.dev',
      'post-deploy': postDeploy,
    },
  },
};
