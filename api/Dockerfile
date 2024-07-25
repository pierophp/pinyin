FROM node:18

ENV TERM xterm

RUN apt-get update && apt-get install -y \
  libstdc++6 poppler-utils && \
  rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

COPY ./ /var/www/pinyin
WORKDIR /var/www/pinyin/

RUN npm install --production
RUN npm run build

ENTRYPOINT [ "node", "/var/www/pinyin/dist/app/server.js" ]
