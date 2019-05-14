#!/usr/bin/env bash
sudo rm -Rf ~/backup

array=(
    "/var/www/api.pinyin/env" 
    "/var/www/api.pinyin.staging/env" 
    "/var/scripts/dump.sh" 
    "/var/local/pinyin" 
    "/etc/nginx" 
    "/etc/elasticsearch" 
)
for element in ${array[@]}
do
    echo $element
    DIRNAME=$element
    if [ ! -d "$DIRNAME" ]; then
        DIRNAME=`dirname $element`
        mkdir -p ~/backup$DIRNAME
        sudo cp -R $element ~/backup$element
    else 
        mkdir -p ~/backup$DIRNAME
        sudo cp -R $DIRNAME/* ~/backup$DIRNAME
    fi
done

/var/scripts/dump.sh

cd ~
sudo tar -czvf backup.tar.gz backup

/var/scripts/store.sh