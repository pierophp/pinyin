cd api/
[[ $TRAVIS_BRANCH = "master" ]] && DEPLOY_ENV="production" || DEPLOY_ENV="staging"
echo "Deploy Starting: $DEPLOY_ENV"
export SSH_KEY="/home/travis/.ssh/id_rsa"
export CMD="scp -o StrictHostKeyChecking=no /home/travis/pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~/pinyin.dist-${TRAVIS_BRANCH}.zip"
$CMD
export CMD="scp -o StrictHostKeyChecking=no /home/travis/bible.pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~/bible.pinyin.dist-${TRAVIS_BRANCH}.zip"
$CMD
export CMD="scp -o StrictHostKeyChecking=no /home/travis/dictionary.pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~/dictionary.pinyin.dist-${TRAVIS_BRANCH}.zip"
$CMD
export CMD="scp -o StrictHostKeyChecking=no /home/travis/videos.pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~/videos.pinyin.dist-${TRAVIS_BRANCH}.zip"
$CMD
export CMD="pm2 deploy ecosystem.config.js $DEPLOY_ENV --force"
$CMD
