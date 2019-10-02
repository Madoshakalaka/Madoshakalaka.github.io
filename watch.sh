#!/usr/bin/env bash

$(npm bin)/webpack --watch &

bundle exec jekyll serve &

wait-on http-get://127.0.0.1:4000 && xdg-open http://127.0.0.1:4000/

cat