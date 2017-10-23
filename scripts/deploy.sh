echo "Deploy Starting"
export SSH_KEY="/home/travis/.ssh/id_rsa"
export CMD="scp -o StrictHostKeyChecking=no /home/travis/pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~"
git checkout -- yarn.lock
$CMD
export CMD="scp -o StrictHostKeyChecking=no /home/travis/bible.pinyin.dist.zip ${SSH_USER}@${SSH_HOST}:~"
$CMD
export CMD="pm2 deploy ecosystem.config.js production"
$CMD
