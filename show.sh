#!/usr/bin/env bash

if [[ $# -eq 0 ]] ; then
    echo 'dumb shit, argument (minima?)'
    exit 1
fi


xdg-open $(bundle show $*)