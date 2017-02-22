FROM ubuntu

RUN \
  apt-get update && \
  apt-get -y upgrade

RUN \
  apt-get -y install npm && \
  npm -g install n

RUN \
  apt-get -y install curl && \
  n latest
