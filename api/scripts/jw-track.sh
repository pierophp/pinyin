#!/bin/bash
cdcd /var/www/api.pinyin/current/api
NODE_ENV=production yarn console jw:track
