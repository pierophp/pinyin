#!/bin/bash
cd /var/www/api.pinyin/current/api/dist/api/app
NODE_ENV=production /usr/local/bin/node console chinesetools:insert
