#!/bib/bash
cd /var/www/api.pinyin/current/api
NODE_ENV=production yarn console chinesetools:insert
