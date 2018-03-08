sudo rm -Rf ~/backup

array=(
    "/var/www/api.pinyin/env" 
    "/var/www/api.pinyin.staging/env" 
    "/var/local/pinyin" 
    "/etc/nginx" 
    "/etc/letsencrypt" 
    "/etc/ssl/certs/dhparam.pem" 
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

cd ~
sudo tar -czvf backup.tar.gz backup
