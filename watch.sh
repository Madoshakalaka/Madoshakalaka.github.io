#!/usr/bin/env bash

$(npm bin)/webpack --watch &

bundle exec jekyll serve &

wait-on http-get://localhost:4000 && xdg-open http://localhost:4000/

cat