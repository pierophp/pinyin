FROM node:8.9

ENV TERM xterm

RUN apt-get update && apt-get install -y \
    libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# FROM node:8.9-alpine

# RUN apk add --update \
#   python \
#   python-dev \
#   py-pip \
#   build-base \
#   curl \
#   && pip install virtualenv \
#   && rm -rf /var/cache/apk/*
