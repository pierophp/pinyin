FROM node:20

ENV TERM xterm

RUN apt-get update && apt-get install -y \
  libstdc++6 poppler-utils && \
  rm -rf /var/lib/apt/lists/*

RUN npm install -g bun

COPY ./ /var/www/pinyin
WORKDIR /var/www/pinyin/

RUN bun install --production
RUN npm run build

RUN ln -s /var/www/pinyin/app/data/jieba.full.utf8 /var/www/pinyin/dist/app/data/jieba.full.utf8
RUN ln -s /var/www/pinyin/app/data/compiled.utf8 /var/www/pinyin/dist/app/data/compiled.utf8

ENTRYPOINT [ "node", "/var/www/pinyin/dist/app/server.js" ]
