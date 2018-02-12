#!/bin/bash
cd /var/www/api.pinyin/current/api
NODE_ENV=production /usr/local/bin/yarn console chinesetools:insert
