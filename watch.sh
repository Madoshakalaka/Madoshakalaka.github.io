#!/usr/bin/env bash

NODE_ENV="development" npx webpack --watch &

bundle exec jekyll serve &

wait-on http-get://localhost:4000 && xdg-open http://localhost:4000/

cat