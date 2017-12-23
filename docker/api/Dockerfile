FROM node:8.9-alpine

RUN apk add --update \
  python \
  python-dev \
  py-pip \
  build-base \
  curl \
  && pip install virtualenv \
  && rm -rf /var/cache/apk/*
