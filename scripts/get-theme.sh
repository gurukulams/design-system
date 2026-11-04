#!/usr/bin/env bash

mkdir -p themes/design-system && \
curl -L https://github.com/gurukulams/design-system/releases/download/latest/site-build.zip \
-o /tmp/site-build.zip && \
unzip -o /tmp/site-build.zip -d themes/design-system && \
rm /tmp/site-build.zip