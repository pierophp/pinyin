## install dependecies
sudo apt upgrade

sudo apt install nginx redis-tools mysql-client npm zip \
     libcurl4-openssl-dev

sudo npm i -g npm knex pm2 yarn n

sudo n latest

## swap
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=2048
sudo /sbin/mkswap /var/swap.1
sudo chmod 600 /var/swap.1
sudo /sbin/swapon /var/swap.1

## ADD TO SWAP /etc/fstab
# /var/swap.1   swap    swap    defaults        0   0

## application live
sudo mkdir /var/www/api.pinyin
sudo mkdir /var/www/api.pinyin/env
sudo nano /var/www/api.pinyin/env/env.js
sudo nano /var/www/api.pinyin/env/newrelic.js
sudo nano /var/www/api.pinyin/env/knexfile.js
sudo cp /var/www/api.pinyin/env/env.js /var/www/api.pinyin/source/api/env.js
git clone https://github.com/pierophp/pinyin.git /var/www/api.pinyin/source
cd /var/www/api.pinyin/source/api
yarn
yarn build

## application staging
sudo mkdir /var/www/api.pinyin.staging
sudo mkdir /var/www/api.pinyin.staging/env
sudo cp /var/www/api.pinyin/env/env.js /var/www/api.pinyin.staging/env/env.js
sudo cp /var/www/api.pinyin/env/knexfile.js /var/www/api.pinyin.staging/env/knexfile.js
sudo cp /var/www/api.pinyin/env/newrelic.js /var/www/api.pinyin.staging/env/newrelic.js
sudo cp /var/www/api.pinyin.staging/env/env.js /var/www/api.pinyin.staging/source/api/env.js
git clone https://github.com/pierophp/pinyin.git /var/www/api.pinyin.staging/source
cd /var/www/api.pinyin.staging/source/api
yarn
yarn build

## pinyin
sudo mkdir /var/www/pinyin
sudo mkdir /var/local/pinyin

## app permission
sudo chown -R ubuntu: /var/www
sudo chown -R ubuntu: /var/local/pinyin

## let's encrypt
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx

crontab -e
nano ~/.ssh/authorized_keys

## logs
sudo touch /var/log/jw-track.log
sudo chown ubuntu: /var/log/jw-track.log
sudo chmod 777 /var/log/jw-track.log

sudo touch /var/log/chinese-tools.log
sudo chown ubuntu: /var/log/chinese-tools.log
sudo chmod 777 /var/log/chinese-tools.log

sudo touch /var/log/glosbe.log
sudo chown ubuntu: /var/log/glosbe.log
sudo chmod 777 /var/log/glosbe.log

# nginx default
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-enabled/http.pinyin
sudo nano /etc/nginx/snippets/ssl-params.conf
sudo nano /etc/ssl/certs/dhparam.pem
sudo /etc/init.d/nginx restart


# nginx api.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d api.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/api.pinyin
sudo nano /etc/nginx/sites-enabled/http.api.pinyin
sudo nano /etc/nginx/snippets/ssl-api.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx backend.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d backend.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/backend.pinyin
sudo nano /etc/nginx/sites-enabled/http.backend.pinyin
sudo nano /etc/nginx/snippets/ssl-backend.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx staging.api.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d staging.api.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/staging.api.pinyin
sudo nano /etc/nginx/snippets/ssl-staging.api.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx staging.videos.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d staging.videos.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/staging.videos.pinyin
sudo nano /etc/nginx/snippets/ssl-staging.videos.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx staging.biblia.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d staging.biblia.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/staging.biblia.pinyin
sudo nano /etc/nginx/snippets/ssl-staging.biblia.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx staging.editor.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d staging.editor.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/staging.editor.pinyin
sudo nano /etc/nginx/snippets/ssl-staging.editor.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

# nginx staging.dicionario.pinyin
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/pinyin -d staging.dicionario.pinyin.giusit.com.br
sudo nano /etc/nginx/sites-enabled/staging.dicionario.pinyin
sudo nano /etc/nginx/snippets/ssl-staging.dicionario.pinyin.giusit.com.br.conf
sudo /etc/init.d/nginx restart

cd /var/local
zip -r /home/ubuntu/storage.zip pinyin
unzip /home/ubuntu/storage.zip -d /var/local
