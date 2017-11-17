const postDeployCommands = [
  'cd /home/ubuntu/',
  // Pinyin Editor UI
  'rm -Rf dist/',
  'unzip pinyin.dist.zip > /dev/null',
  'BRANCH="$(cat dist/branch.txt)"',
  'echo $BRANCH',
  '[[ $BRANCH = "master" ]] && UI_PATH="/var/www/pinyin.dev" || UI_PATH="/var/www/pinyin.dev"',
  'echo $UI_PATH',
  'sudo rm -Rf $UI_PATH',
  'mv /home/ubuntu/dist $UI_PATH',
  'ln -s /var/local/pinyin/Dicionario_Pleco.txt /var/www/pinyin/Dicionario_Pleco.txt',
  // Bible Editor UI
  'rm -Rf dist/',
  'unzip bible.pinyin.dist.zip > /dev/null',
  'sudo rm -Rf /var/www/bible.pinyin',
  'mv /home/ubuntu/dist /var/www/bible.pinyin',
  // Dictionary Editor UI
  'rm -Rf dist/',
  'unzip dictionary.pinyin.dist.zip > /dev/null',
  'sudo rm -Rf /var/www/dictionary.pinyin',
  'mv /home/ubuntu/dist /var/www/dictionary.pinyin',
  // Videos Editor UI
  'rm -Rf dist/',
  'unzip videos.pinyin.dist.zip > /dev/null',
  'sudo rm -Rf /var/www/videos.pinyin',
  'mv /home/ubuntu/dist /var/www/videos.pinyin',
  // API
  'cd /var/www/api.pinyin/current/api',
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
  },
};
